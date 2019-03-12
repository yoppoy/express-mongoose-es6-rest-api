const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');
const lockerState = require('./locker.helper').state;

/**
 * Locker Schema
 */
const LockerSchema = new mongoose.Schema({
  bluetoothAddress: {
    type: [Number],
    required: true,
    unique: true
  },
  bluetoothPassword: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    default: lockerState.open
  },
  content: {
    type: mongoose.Schema.Types.ObjectId
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
LockerSchema.method({
  open() {
    return new Promise((resolve, reject) => {
      if (this.state !== lockerState.open) {
        this.update({content: null, state: lockerState.open}).then(() => {
          resolve(this.content);
        }).catch((e) => reject(e));
      }
      else {
        reject('Locker is already open');
      }
    });
  },
  close(cylinder) {
    return new Promise((resolve, reject) => {
      if (this.state === lockerState.open) {
        this.update({content: cylinder._id, state: lockerState.closed}).then(() => {
          resolve('OK');
        }).catch((e) => reject(e));
      }
      else {
        reject('Locker is already open');
      }
    });
  }
});

/**
 * Statics
 */
LockerSchema.statics = {
  /**
   * Get locker
   * @param {ObjectId} id - The objectId of locker.
   * @returns {Promise<Locker, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((locker) => {
        if (locker) {
          return locker;
        }
        const err = new APIError('No such locker exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  findByAddress(address) {
    return this.find({ bluetoothAddress: address })
      .exec()
      .then((locker) => {
        if (locker) {
          return locker;
        }
        const err = new APIError('No such locker exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List lockers in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of lockers to be skipped.
   * @param {number} limit - Limit number of lockers to be returned.
   * @returns {Promise<Locker[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Locker
 */
module.exports = mongoose.model('Locker', LockerSchema);
