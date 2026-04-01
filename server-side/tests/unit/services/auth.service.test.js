/**
 * Unit Tests for Auth Service
 * Tests: login, register, token refresh, password hashing
 */

const { authService } = require('../../../src/services');
const { userRepository } = require('../../../src/repositories');
const { hash } = require('../../../src/utils/hash');
const fixtures = require('../../fixtures');

describe('AuthService', () => {
  beforeEach(async () => {
    // Clear test data before each test
    await global.testDB.user.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = await fixtures.userFactory.valid();

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.is_active).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      const userData = await fixtures.userFactory.valid();
      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should hash password before storing', async () => {
      const userData = await fixtures.userFactory.valid();
      await authService.register(userData);

      const user = await global.testDB.user.findUnique({
        where: { email: userData.email },
      });

      // Password should be hashed differently
      expect(user.password).not.toBe(userData.password);
    });

    it('should reject invalid email', async () => {
      const userData = await fixtures.userFactory.invalid();

      await expect(authService.register(userData)).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      await authService.register(userData);
    });

    it('should login user with correct credentials', async () => {
      const loginData = await fixtures.authFactory.loginRequest({
        email: (await global.testDB.user.findFirst()).email,
        password: 'testPassword123',
      });

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBeValidJWT();
    });

    it('should reject invalid password', async () => {
      const user = await global.testDB.user.findFirst();

      await expect(
        authService.login({
          email: user.email,
          password: 'wrongPassword123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    let refreshToken;

    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      refreshToken = registered.refresh_token;
    });

    it('should generate new access token with valid refresh token', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBeValidJWT();
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid.token.here')
      ).rejects.toThrow();
    });
  });

  describe('getUserDetails', () => {
    let userId;

    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid();
      const registered = await authService.register(userData);
      userId = registered.user.id;
    });

    it('should return user details', async () => {
      const user = await authService.getUserDetails(userId);

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('full_name');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.getUserDetails('nonexistent-id')
      ).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    let userId;
    let originalPassword = 'testPassword123';

    beforeEach(async () => {
      const userData = await fixtures.userFactory.valid({
        password: originalPassword,
      });
      const registered = await authService.register(userData);
      userId = registered.user.id;
    });

    it('should change password successfully', async () => {
      const newPassword = 'newPassword456';

      await authService.changePassword(userId, {
        currentPassword: originalPassword,
        newPassword,
        confirmPassword: newPassword,
      });

      // Try login with new password
      const user = await global.testDB.user.findUnique({
        where: { id: userId },
      });

      const loginResult = await authService.login({
        email: user.email,
        password: newPassword,
      });

      expect(loginResult).toHaveProperty('access_token');
    });

    it('should reject incorrect current password', async () => {
      await expect(
        authService.changePassword(userId, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
          confirmPassword: 'newPassword456',
        })
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should reject mismatched passwords', async () => {
      await expect(
        authService.changePassword(userId, {
          currentPassword: originalPassword,
          newPassword: 'newPassword456',
          confirmPassword: 'differentPassword789',
        })
      ).rejects.toThrow('Passwords do not match');
    });
  });
});
