const jwt = require('express-jwt');
const config = require('../../config/config');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    return authorization.split(' ')[1];
  }
  return null;
};

const authHelper = {
  required: jwt({
    secret: config.jwtSecret,
    requestProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: config.jwtSecret,
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = authHelper;
