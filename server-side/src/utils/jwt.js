/**
 * JWT Utility Functions
 * Handles token generation, verification, and refresh
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'lms-api',
    audience: 'lms-web'
  });
};

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'lms-api'
  });
};

/**
 * Verify Access Token
 * @param {string} token - Token to verify
 * @returns {Object} Decoded payload or throws error
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'lms-api',
      audience: 'lms-web'
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded payload or throws error
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'lms-api'
    });
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

/**
 * Decode Token without verification (for inspection)
 * @param {string} token - Token to decode
 * @returns {Object} Decoded payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
