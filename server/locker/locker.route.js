const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const lockerCtrl = require('./locker.controller');
const { auth } = require('../helpers/auth');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/locker - Get list of locker */
  .get(auth.required, auth.scope.check('admin', 'locker:read'), lockerCtrl.list)

  /** POST /api/locker - Create new locker */
  .post(auth.required, auth.scope.check('admin', 'locker:create'), validate(paramValidation.createLocker), lockerCtrl.create);

router.route('/:lockerId')
  /** GET /api/locker/:lockerId - Get locker */
  .get(auth.required, auth.scope.check('admin', 'locker:read'), lockerCtrl.get)

  /** PUT /api/locker/:lockerId - Update locker */
  .put(auth.required, auth.scope.check('admin', 'locker:modify'), validate(paramValidation.updateLocker), lockerCtrl.update)

  /** DELETE /api/locker/:lockerId - Delete locker */
  .delete(auth.required, auth.scope.check('admin', 'locker:delete'), lockerCtrl.remove);

router.route('/withdraw')
  /** POST /api/locker/withdraw - Withdraw locker */
  .post(auth.required, validate(paramValidation.withdrawCylinder), lockerCtrl.withdrawCylinder);

router.route('/deposit')
/** POST /api/locker/deposit - Deposit cylinder in locker */
  .post(auth.required, validate(paramValidation.depositCylinder), lockerCtrl.depositCylinder);

/** Load locker when API with lockerId route parameter is hit */
router.param('lockerId', lockerCtrl.load);

module.exports = router;
