const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const userCtrl = require('../../user/user.controller');
const { auth} = require('../../auth/auth.helper');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/tokens/purchase')
  /** POST /api/inventory/tokens/purchase - Purchase tokens */
  .post(auth.required, userCtrl.purchaseTokens);

module.exports = router;
