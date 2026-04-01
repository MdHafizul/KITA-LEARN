/**
 * Integration Tests for Course API Endpoints
 * Tests: CRUD courses, publish, archive
 */

const request = require('supertest');
const { createApp } = require('../../../src/app');
const { authService, courseService } = require('../../../src/services');
const fixtures = require('../../fixtures');

describe('Course API Endpoints', () => {
  let app;
  let server;
  let lecturerToken;
  let studentToken;
  let lecturerId;
  let studentId;
  let courseId;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(3002);
  });

  afterAll(async () => {
    server.close();
  });

  beforeEach(async () => {
    // Create lecturer and get token
    const lecturerData = await fixtures.userFactory.lecturer();
    const lecturerReg = await authService.register(lecturerData);
    lecturerToken = lecturerReg.access_token;
    lecturerId = lecturerReg.user.id;

    // Create student and get token
    const studentData = await fixtures.userFactory.valid();
    const studentReg = await authService.register(studentData);
    studentToken = studentReg.access_token;
    studentId = studentReg.user.id;

    // Create test course
    const courseData = await fixtures.courseFactory.valid(lecturerId);
    const created = await courseService.createCourse(courseData, lecturerId);
    courseId = created.id;
  });

  describe('POST /api/v1/courses', () => {
    it('should create course as lecturer', async () => {
      const courseData = await fixtures.courseFactory.valid(lecturerId);

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${lecturerToken}`)
        .send(courseData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(courseData.title);
    });

    it('should reject course creation by student', async () => {
      const courseData = await fixtures.courseFactory.valid(lecturerId);

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(courseData)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid course data', async () => {
      const invalidData = await fixtures.courseFactory.invalid();

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${lecturerToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/courses', () => {
    it('should list all courses', async () => {
      const res = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/courses?page=1&limit=10')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('pagination');
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should retrieve course details', async () => {
      const res = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const res = await request(app)
        .get('/api/v1/courses/nonexistent-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    it('should update course by lecturer', async () => {
      const updates = {
        title: 'Updated Course Title',
        description: 'Updated description',
      };

      const res = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${lecturerToken}`)
        .send(updates)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updates.title);
    });

    it('should reject update by non-lecturer', async () => {
      const res = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/courses/:id/publish', () => {
    it('should publish course', async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.is_published).toBe(true);
    });

    it('should reject publish by non-lecturer', async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/courses/:id/archive', () => {
    beforeEach(async () => {
      // Publish course first
      await courseService.publishCourse(courseId, lecturerId);
    });

    it('should archive published course', async () => {
      const res = await request(app)
        .post(`/api/v1/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.is_published).toBe(false);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should soft-delete course', async () => {
      const res = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should reject delete by non-lecturer', async () => {
      const res = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
