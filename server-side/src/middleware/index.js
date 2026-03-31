module.exports = {
  ...require('./auth.middleware'),
  ...require('./validation.middleware'),
  ...require('./error.middleware'),
  cors: require('./cors.middleware')
};
