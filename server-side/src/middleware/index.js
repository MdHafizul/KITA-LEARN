module.exports = {
  ...require('./auth.middleware'),
  ...require('./validation.middleware'),
  errorHandler: require('./error.middleware').errorMiddleware,
  notFoundHandler: require('./error.middleware').notFoundMiddleware,
  corsMiddleware: require('./cors.middleware')
};
