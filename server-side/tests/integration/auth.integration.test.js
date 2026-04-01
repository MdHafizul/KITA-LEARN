/**
 * Integration Tests for Auth API Endpoints
 * Tests: Login, Register, Refresh Token, Profile endpoints
 */

const request = require('supertest');
const { createApp } = require('../../../src/app');
const { authService } = require('../../../src/services');
const fixtures = require('../../fixtures');

describe('Auth API Endpoints', () => {
  let app;
  let server;
  let accessToken;
  let refreshToken;
  let userId;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(3001);
  });

  afterAll(async () => {
    server.close();
  });

  beforeEach(async () => {
    await global.testDB.user.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = await fixtures.authFactory.registerRequest();

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data.user.email).toBe(userData.email);

      // Store for later tests
      accessToken = res.body.data.access_token;
      refreshToken = res.body.data.refresh_token;
      userId = res.body.data.user.id;
    });

    it('should reject duplicate email', async () => {
      const userData = await fixtures.authFactory.registerRequest();
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already registered');
    });

    it('should reject invalid email', async () => {
      const userData = await fixtures.authFactory.registerRequest({
        email: 'invalid-email',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject mismatched passwords', async () => {
      const userData = await fixtures.authFactory.registerRequest({
        password: 'password123',
        confirmPassword: 'different456',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const userData = await fixtures.authFactory.registerRequest({
        password: '123',
        confirmPassword: '123',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      refreshToken = registered.refresh_token;
      userId = registered.user.id;
    });

    it('should login with valid credentials', async () => {
      const loginData = await fixtures.authFactory.loginRequest({
        email: (await global.testDB.user.findUnique({ where: { id: userId } }))
          .email,
        password: 'testPassword123',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
    });

    it('should reject invalid password', async () => {
      const user = await global.testDB.user.findUnique({ where: { id: userId } });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'wrongPassword',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      refreshToken = registered.refresh_token;
      userId = registered.user.id;
    });

    it('should refresh token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data.access_token).toBeValidJWT();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      userId = registered.user.id;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      userId = registered.user.id;
    });

    it('should update user profile', async () => {
      const updates = {
        full_name: 'Updated Name',
        phone_number: '+1-999-999-9999',
      };

      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe(updates.full_name);
      expect(res.body.data.phone_number).toBe(updates.phone_number);
    });

    it('should reject unauthorized profile update', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .send({ full_name: 'Hacker Name' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      userId = registered.user.id;
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'testPassword123',
          newPassword: 'newPassword456',
          confirmPassword: 'newPassword456',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('changed');
    });

    it('should reject incorrect current password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
          confirmPassword: 'newPassword456',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      accessToken = registered.access_token;
      userId = registered.user.id;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
