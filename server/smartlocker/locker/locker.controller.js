const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');
const Locker = require('./locker.model');
const lockerState = require('./locker.helper').state;
const User = require('../../user/user.model');
const Cylinder = require('../cylinder/cylinder.model');

/**
 * Load locker and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    req.locker = await Locker.get(id);
    return next();
  } catch (e) {
    next(e);
  }
};

/**
 * Get locker
 * @returns {Locker}
 */
const get = (req, res) => {
  return res.json(req.locker);
};

/**
 * Create new locker
 * @property {string} req.body.bluetoothAddress - The address of locker
 * @property {string} req.body.bluetoothPassword - The bluetooth password of the locker
 * @returns {Locker}
 */
const create = async (req, res, next) => {
  let savedLocker;
  const locker = new Locker({
    bluetoothAddress: req.body.bluetoothAddress,
    bluetoothPassword: req.body.bluetoothPassword
  });

  try {
    savedLocker = await locker.save();
    res.json({locker: savedLocker});
  } catch (e) {
    next(handleMongooseError(e));
  }
};

const withdrawCylinder = async (req, res, next) => {
  try {
    let locker;
    let user = await User.get(req.jwt.id);

    if (user.tokens > 0) {
      locker = await Locker.get(req.body.lockerId);
      console.log('about to withdraw');
      await user.withdrawCylinder(locker);
      console.log('done withdraw');
      res.json(httpStatus.OK);
    }
    else {
      next(new APIError('Insufficient tokens', httpStatus.BAD_REQUEST));
    }
  } catch (e) {
    next(e);
  }
};

/**
 * De
 * @property {string} req.body.lockerId - The id of the locker
 * @returns {Promise<void>}
 */
const depositCylinder = async (req, res, next) => {
  let user;
  let locker;
  let cylinder;

  try {
    user = await User.get(req.jwt.id);
    locker = await Locker.get(req.body.lockerId);
    if (locker.state === lockerState.closed) {
      next(new APIError('Locker already contains something', httpStatus.BAD_REQUEST));
    }
    cylinder = await Cylinder.findOneOrCreate(req.body.cylinderId);
    console.log('about to deposit');
    await user.depositCylinder(cylinder, locker);
    console.log('done depositting');
    res.json(httpStatus.OK);
  } catch (e) {
    next(e);
  }
};

/**
 * Update existing locker
 * @property {string} req.body.bluetoothAddress - The address of locker
 * @property {string} req.body.bluetoothPassword - The bluetooth password of the locker
 * @returns {Locker}
 */
const update = (req, res, next) => {
  const locker = req.locker;

  locker.bluetoothAddress = req.body.bluetoothAddress;
  locker.bluetoothPassword = req.body.bluetoothPassword;
  locker.state = req.body.state;
  locker.save()
    .then(savedLocker => res.json(savedLocker))
    .catch(e => next(e));
};

/**
 * Get locker list.
 * @property {number} req.query.skip - Number of lockers to be skipped.
 * @property {number} req.query.limit - Limit number of lockers to be returned.
 * @returns {Locker[]}
 */
const list = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;

  Locker.list({ limit, skip })
    .then(lockers => res.json(lockers))
    .catch(e => next(e));
};

/**
 * Delete locker.
 * @returns {Locker}
 */
const remove = (req, res, next) => {
  const locker = req.locker;

  locker.remove()
    .then(deletedLocker => res.json({locker : deletedLocker}))
    .catch(e => next(e));
};

module.exports = { load, get, create, update, list, remove, withdrawCylinder, depositCylinder };

/**
 * Handle Mongoose Error
 * @param err
 * @returns {*}
 */
const handleMongooseError = (err) => {
  let error;

  if (err.code === 11000) {
    error = new APIError('Locker with current address already exists', httpStatus.BAD_REQUEST, true);
  }
  else {
    error = err;
  }
  return (error);
};
