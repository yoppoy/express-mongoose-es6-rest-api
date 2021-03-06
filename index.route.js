const express = require('express');
const authRoutes = require('./server/auth/auth.route');
const userRoutes = require('./server/user/user.route');
const adminRoutes = require('./server/admin/admin.route');
const lockerRoutes = require('./server/smartlocker/locker/locker.route');
const inventoryRoutes = require('./server/smartlocker/inventory/token.route');
const httpStatus = require('http-status');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send(httpStatus.OK)
);

router.use('', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/locker', lockerRoutes);
router.use('/inventory', inventoryRoutes);


module.exports = router;
