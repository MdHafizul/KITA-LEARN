module.exports = {
  ...require('./auth.middleware'),
  ...require('./validation.middleware'),
  ...require('./error.middleware'),
  corsMiddleware: require('./cors.middleware')
};
