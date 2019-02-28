const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const User = require('../user/user.model');

/**
 * Create new user
 * @property {string} req.body.email - The username of user.
 * @returns {User}
 */
function create(req, res, next) {
  const user = new User({
    email: req.body.email,
    scope: 'admin'
  });
  user.setPassword(req.body.password)
    .then(() => {
      user.save()
        .then(savedUser => res.json({ user: savedUser.toJSON(), token: user.generateJWT() }))
        .catch((e) => {
          next(handleMongooseError(e));
        });
    });
}
/**
 * Get admin list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.listAdmin({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

module.exports = { create, list };

/**
 * Handle Mongoose Error
 * @param err
 * @returns {*}
 */
function handleMongooseError(err) {
  let error;

  if (err.code === 11000) {
    error = new APIError('email already used', httpStatus.BAD_REQUEST, true);
  }
  else {
    error = err;
  }
  return (error);
}
