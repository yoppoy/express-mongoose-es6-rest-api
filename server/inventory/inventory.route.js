const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('../user/user.controller');
const { auth, permissions } = require('../helpers/auth');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/tokens/purchase')
  /** POST /api/inventory/tokens/purchase - Purchase tokens */
  .post(auth.required, userCtrl.purchaseTokens);

//router.route('/events')
  /** GET /api/inventory/events - Get events */
  // .get(auth.required, userCtrl.get);

module.exports = router;
