const jwt = require('express-jwt');
const config = require('../../config/config');
const scope = require('express-jwt-permissions')({
  requestProperty: 'jwt',
  permissionsProperty: 'scope'
});

/**
 * Extra permissions grantable to user
 * @type {{user: {read: string, modify: string, delete: string}}}
 */
const permissions = {
  user: {
    read: 'user:read',
    modify: 'user:modify',
    delete: 'user:delete',
  }
};

/**
 * Will validate if :
 *  - user is accessing their own user data
 *  - admin
 *  - extraPermissions validate
 * @param extraPermissions : custom permissions
 * @returns {Function}
 */
const personal = (...extraPermissions) => {
  return (req, res, next) => {
    if (req.user._id.toString() === req.jwt.id) {
      next();
    }
    else {
      scope.check(['admin'], extraPermissions)(req, res, next);
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
  personal,
  scope
};

module.exports = { auth, permissions };
