const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const expressJwt = require('express-jwt');
const config = require('../../config/config');
const authCtrl = require('./auth.controller');
const { auth } = require('./auth.helper');

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided
 *  */
router.route('/login')
  .post(auth.optional, validate(paramValidation.login), authCtrl.login);

router.route('/logout')
  .post(auth.required, authCtrl.logout);

module.exports = router;
