/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing
 */

const cors = require('cors');
const env = require('../config/env');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600
};

module.exports = cors(corsOptions);
