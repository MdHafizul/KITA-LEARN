/**
 * Unit Tests for Course Service
 * Tests: create, update, publish, archive courses
 */

const { courseService } = require('../../../src/services');
const { authService } = require('../../../src/services');
const fixtures = require('../../fixtures');

describe('CourseService', () => {
  let lecturerId;
  let courseId;

  beforeEach(async () => {
    // Create a lecturer user
    const lecturerData = await fixtures.userFactory.lecturer();
    const registered = await authService.register(lecturerData);
    lecturerId = registered.user.id;

    // Create a test course
    const courseData = await fixtures.courseFactory.valid(lecturerId);
    const created = await courseService.createCourse(courseData, lecturerId);
    courseId = created.id;
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const courseData = await fixtures.courseFactory.valid(lecturerId);

      const course = await courseService.createCourse(courseData, lecturerId);

      expect(course).toHaveProperty('id');
      expect(course.title).toBe(courseData.title);
      expect(course.lecturer_id).toBe(lecturerId);
      expect(course.is_published).toBe(false);
    });

    it('should reject invalid course data', async () => {
      const invalidData = await fixtures.courseFactory.invalid();

      await expect(
        courseService.createCourse(invalidData, lecturerId)
      ).rejects.toThrow();
    });

    it('should create course with max students limit', async () => {
      const courseData = await fixtures.courseFactory.valid(lecturerId, {
        max_students: 100,
      });

      const course = await courseService.createCourse(courseData, lecturerId);

      expect(course.max_students).toBe(100);
    });
  });

  describe('updateCourse', () => {
    it('should update course details', async () => {
      const updates = {
        title: 'Updated Course Title',
        description: 'Updated description',
      };

      const updated = await courseService.updateCourse(
        courseId,
        updates,
        lecturerId
      );

      expect(updated.title).toBe(updates.title);
      expect(updated.description).toBe(updates.description);
    });

    it('should not allow non-lecturer to update', async () => {
      const studentData = await fixtures.userFactory.valid();
      const registered = await authService.register(studentData);

      await expect(
        courseService.updateCourse(
          courseId,
          { title: 'New Title' },
          registered.user.id
        )
      ).rejects.toThrow();
    });

    it('should reject invalid updates', async () => {
      await expect(
        courseService.updateCourse(
          courseId,
          { max_students: -10 },
          lecturerId
        )
      ).rejects.toThrow();
    });
  });

  describe('publishCourse', () => {
    it('should publish a draft course', async () => {
      const published = await courseService.publishCourse(courseId, lecturerId);

      expect(published.is_published).toBe(true);
      expect(published.status).toBe('active');
    });

    it('should not allow publishing already published course', async () => {
      await courseService.publishCourse(courseId, lecturerId);

      await expect(
        courseService.publishCourse(courseId, lecturerId)
      ).rejects.toThrow();
    });

    it('should not allow non-lecturer to publish', async () => {
      const studentData = await fixtures.userFactory.valid();
      const registered = await authService.register(studentData);

      await expect(
        courseService.publishCourse(courseId, registered.user.id)
      ).rejects.toThrow();
    });
  });

  describe('archiveCourse', () => {
    it('should archive an active course', async () => {
      await courseService.publishCourse(courseId, lecturerId);
      const archived = await courseService.archiveCourse(courseId, lecturerId);

      expect(archived.is_published).toBe(false);
      expect(archived.status).toBe('archived');
    });

    it('should not allow non-lecturer to archive', async () => {
      const studentData = await fixtures.userFactory.valid();
      const registered = await authService.register(studentData);

      await expect(
        courseService.archiveCourse(courseId, registered.user.id)
      ).rejects.toThrow();
    });
  });

  describe('getCourseDetails', () => {
    it('should retrieve course with all details', async () => {
      const course = await courseService.getCourseDetails(courseId);

      expect(course.id).toBe(courseId);
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('description');
      expect(course).toHaveProperty('lecturer_id');
    });

    it('should throw error for non-existent course', async () => {
      await expect(
        courseService.getCourseDetails('nonexistent-id')
      ).rejects.toThrow();
    });
  });

  describe('searchCourses', () => {
    beforeEach(async () => {
      // Create multiple courses
      for (let i = 0; i < 5; i++) {
        const courseData = await fixtures.courseFactory.valid(lecturerId, {
          title: `JavaScript Course ${i}`,
        });
        await courseService.createCourse(courseData, lecturerId);
      }
    });

    it('should search courses by keyword', async () => {
      const results = await courseService.searchCourses('JavaScript', {
        page: 1,
        limit: 10,
      });

      expect(results.data.length).toBeGreaterThan(0);
      expect(results.data[0].title).toContain('JavaScript');
    });

    it('should return paginated results', async () => {
      const results = await courseService.searchCourses('JavaScript', {
        page: 1,
        limit: 3,
      });

      expect(results.pagination.page).toBe(1);
      expect(results.pagination.limit).toBe(3);
      expect(results.pagination).toHaveProperty('total');
    });

    it('should return empty results for non-matching keyword', async () => {
      const results = await courseService.searchCourses('Python', {
        page: 1,
        limit: 10,
      });

      expect(results.data.length).toBe(0);
    });
  });
});
