const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { courseRepository } = require('../repositories');

const prisma = new PrismaClient();

class CourseService {
  /**
   * Create a new course
   */
  async createCourse(data, lecturerId) {
    const { course_code, title, description, credits, max_students, difficulty_level, start_date, end_date } = data;

    // Verify lecturer exists
    const lecturer = await prisma.lecturerProfile.findUnique({
      where: { user_id: lecturerId }
    });

    if (!lecturer) {
      throw new ValidationException('Lecturer profile not found');
    }

    const course = await prisma.course.create({
      data: {
        course_code,
        title,
        description,
        credits: parseInt(credits),
        max_students: parseInt(max_students),
        difficulty_level,
        lecturer_id: lecturer.id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: 'draft'
      },
      include: { lecturer: true }
    });

    // Log audit
    await this.logAudit(lecturerId, 'create_course', `Created course: ${title}`, 'course', course.id);

    return course;
  }

  /**
   * Update course details
   */
  async updateCourse(courseId, data, userId) {
    const { title, description, credits, max_students, difficulty_level, start_date, end_date } = data;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    // Authorization check
    if (course.lecturer.user_id !== userId) {
      throw new ValidationException('Only course lecturer can update');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || course.title,
        description: description || course.description,
        credits: credits ? parseInt(credits) : course.credits,
        max_students: max_students ? parseInt(max_students) : course.max_students,
        difficulty_level: difficulty_level || course.difficulty_level,
        start_date: start_date ? new Date(start_date) : course.start_date,
        end_date: end_date ? new Date(end_date) : course.end_date,
        updated_at: new Date()
      }
    });

    await this.logAudit(userId, 'update_course', `Updated course: ${course.title}`, 'course', courseId);

    return updated;
  }

  /**
   * Publish a course (make it available for enrollment)
   */
  async publishCourse(courseId, userId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (course.lecturer.user_id !== userId) {
      throw new ValidationException('Only course lecturer can publish');
    }

    if (course.status === 'published') {
      throw new ValidationException('Course is already published');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'published',
        published_at: new Date(),
        updated_at: new Date()
      }
    });

    await this.logAudit(userId, 'publish_course', `Published course: ${course.title}`, 'course', courseId);

    return updated;
  }

  /**
   * Archive a course
   */
  async archiveCourse(courseId, userId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (course.lecturer.user_id !== userId) {
      throw new ValidationException('Only course lecturer can archive');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'archived',
        updated_at: new Date()
      }
    });

    await this.logAudit(userId, 'archive_course', `Archived course: ${course.title}`, 'course', courseId);

    return updated;
  }

  /**
   * Get course with full content
   */
  async getCourseWithContent(courseId) {
    const course = await courseRepository.findWithContent(courseId);

    if (!course) {
      throw new ValidationException('Course not found');
    }

    return course;
  }

  /**
   * Get course statistics
   */
  async getCourseStats(courseId) {
    const stats = await courseRepository.getStats(courseId);
    return stats;
  }

  /**
   * Search courses
   */
  async searchCourses(query, page = 1, limit = 10) {
    const courses = await courseRepository.search(query, page, limit);
    return courses;
  }

  /**
   * Get published courses
   */
  async getPublishedCourses(page = 1, limit = 10) {
    const courses = await courseRepository.findPublished(page, limit);
    return courses;
  }

  /**
   * Add course prerequisites
   */
  async addPrerequisite(courseId, prerequisiteId, userId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (course.lecturer.user_id !== userId) {
      throw new ValidationException('Only course lecturer can add prerequisites');
    }

    const prerequisite = await prisma.course.findUnique({
      where: { id: prerequisiteId }
    });

    if (!prerequisite) {
      throw new ValidationException('Prerequisite course not found');
    }

    await prisma.coursePrerequisite.create({
      data: {
        course_id: courseId,
        prerequisite_id: prerequisiteId
      }
    });

    await this.logAudit(userId, 'add_prerequisite', `Added prerequisite to course: ${course.title}`, 'course', courseId);

    return { message: 'Prerequisite added successfully' };
  }

  /**
   * Log audit trail
   */
  async logAudit(userId, action, description, model_type, model_id) {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        description,
        model_type,
        model_id,
        ip_address: '0.0.0.0', // Would be from request context
        user_agent: 'api'
      }
    });
  }

  /**
   * Delete course (soft delete)
   */
  async deleteCourse(courseId, userId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (course.lecturer.user_id !== userId) {
      throw new ValidationException('Only course lecturer can delete');
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { deleted_at: new Date() }
    });

    await this.logAudit(userId, 'delete_course', `Deleted course: ${course.title}`, 'course', courseId);

    return { message: 'Course deleted successfully' };
  }
}

module.exports = new CourseService();
