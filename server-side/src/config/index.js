/**
 * Config Barrel Export
 */

module.exports = {
  env: require('./env'),
  ...require('./database'),
  ...require('./redis'),
  ...require('./constants')
};
