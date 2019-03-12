const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('./user.controller');
const { auth, permissions } = require('../auth/auth.helper');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/users - Get list of users */
  .get(auth.required, auth.scope.check('admin'), userCtrl.list)

  /** POST /api/users - Create new user */
  .post(auth.optional, validate(paramValidation.createUser), userCtrl.create);

router.route('/:userId')
/** GET /api/users/:userId - Get user */
  .get(auth.required, auth.personal(permissions.user.read), userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(auth.required, auth.personal(permissions.user.modify), validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(auth.required, auth.personal(permissions.user.delete), userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
