const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CourseRepository extends BaseRepository {
  constructor() {
    super(prisma.course);
  }

  /**
   * Find published courses
   */
  async findPublished(options = {}) {
    return this.findMany(
      { status: 'PUBLISHED', deletedAt: null },
      options
    );
  }

  /**
   * Find course with all materials and activities
   */
  async findWithContent(courseId) {
    return this.model.findUnique({
      where: { id: courseId },
      include: {
        materials: true,
        activities: true,
        prerequisites: true,
        enrollments: { include: { user: true } },
        instructor: true,
      },
    });
  }

  /**
   * Find courses by instructor
   */
  async findByInstructor(instructorId, options = {}) {
    return this.findMany(
      { instructorId, deletedAt: null },
      options
    );
  }

  /**
   * Search courses by title or description
   */
  async search(query, options = {}) {
    return this.findMany(
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
      options
    );
  }

  /**
   * Get course statistics
   */
  async getStats(courseId) {
    const course = await this.model.findUnique({
      where: { id: courseId },
      include: {
        enrollments: true,
        activities: true,
        materials: true,
      },
    });

    if (!course) return null;

    return {
      courseId,
      enrollmentCount: course.enrollments.length,
      activityCount: course.activities.length,
      materialCount: course.materials.length,
      totalContent: course.activities.length + course.materials.length,
    };
  }

  /**
   * Get courses with prerequisites met
   */
  async findWithPrerequisitesMet(userId, options = {}) {
    const courses = await this.model.findMany({
      where: {
        OR: [
          { prerequisites: { none: {} } }, // No prerequisites
          {
            prerequisites: {
              every: {
                prerequisiteCourse: {
                  enrollments: {
                    some: {
                      userId,
                      status: 'COMPLETED',
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        prerequisites: true,
        instructor: true,
      },
    });

    return courses;
  }
}

module.exports = CourseRepository;
