const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const passport = require('passport');
const { objToString } = require('../helpers/utils');

/**
 * Login user
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
    const error = new APIError(objToString(info.errors), httpStatus.BAD_REQUEST, true);
    return next(error);
  })(req, res, next);
}

/**
 * Logout user
 * @param req
 * @param res
 * @param next
 */
function logout(req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
}

module.exports = { login, logout };
