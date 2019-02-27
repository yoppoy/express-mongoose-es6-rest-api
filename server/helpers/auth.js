const jwt = require('express-jwt');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const config = require('../../config/config');
const permissions = require('express-jwt-permissions')();
const role = require('./role');

/**
 * Will validate if :
 *  - user is accessing their own user data
 *  - admin
 *  - extraPermissions validate
 * @param extraPermissions : custom permissions
 * @returns {Function}
 */
const authPersonal = (...extraPermissions) => {
  return (req, res, next) => {
    if (req.user._id.toString() === req.jwt.id) {
      next();
    }
    else {
      permissions.check(['admin'], extraPermissions)(req, res, next);
    }
  };
};

/**
 * Manages whether JWT token is checked
 * @type {{required: middleware, optional: middleware}}
 */
const auth = {
  required: jwt({
    secret: config.jwtSecret,
    requestProperty: 'jwt',
  }),
  optional: jwt({
    secret: config.jwtSecret,
    credentialsRequired: false,
  }),
};

module.exports = { auth, authPersonal };
