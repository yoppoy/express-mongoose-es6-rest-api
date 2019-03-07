const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('../user/user.controller');
const adminCtrl = require('./admin.controller');
const { auth } = require('../helpers/auth');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/users - Get list of admins */
  .get(auth.required, auth.scope.check('admin'), adminCtrl.list)

  /** POST /api/users - Create new admin */
  .post(auth.required, auth.scope.check('admin'), validate(paramValidation.createUser), adminCtrl.create);

router.route('/:userId')
/** GET /api/users/:userId - Get user */
  .get(auth.required, auth.scope.check('admin'), userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(auth.required, auth.scope.check('admin'), validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(auth.required, auth.scope.check('admin'), userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;