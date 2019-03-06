const express = require('express');
const authRoutes = require('./server/auth/auth.route');
const userRoutes = require('./server/user/user.route');
const adminRoutes = require('./server/admin/admin.route');
const lockerRoutes = require('./server/locker/locker.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/locker', lockerRoutes);


module.exports = router;
