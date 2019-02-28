const express = require('express');
const authRoutes = require('./server/auth/auth.route');
const userRoutes = require('./server/user/user.route');
const adminRoutes = require('./server/admin/admin.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('', authRoutes);

// mount user routes at /users
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);


module.exports = router;
