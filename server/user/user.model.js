const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const Event = require('../smartlocker/event/event.model');
const {eventType} = require('../smartlocker/event/event.helper');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    default: 'basic'
  },
  tokens: {
    type: Number,
    default: 0
  },
  cylinders:{
    type: [mongoose.Schema.Types.ObjectId]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
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
UserSchema.method({
  /* Auth */
  setPassword(password) {
    return new Promise((resolve, reject) => {
      (bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        }
        this.password = hash;
        resolve();
      }));
    });
  },
  validatePassword(password) {
    return (bcrypt.compareSync(password, this.password));
  },
  generateJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + config.sessionDuration);
    const jwtToken = jwt.sign({
      id: this._id,
      email: this.email,
      scope: this.scope,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    }, config.jwtSecret);
    return (jwtToken);
  },
  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      scope: this.scope,
      tokens: this.tokens,
    };
  },
  async depositCylinder(cylinder, locker) {
    await locker.close(cylinder);
    await Event.create(eventType.deposit, this._id, {
      cylinderId: cylinder._id,
      lockerId: locker._id
    });
  },
  async withdrawCylinder(locker) {
    let cylinderId;

    if (this.tokens >= 1) {
      cylinderId = await locker.open();
      await this.update({ tokens: this.tokens - 1, cylinders: [...this.cylinders, cylinderId] });
      await Event.create(eventType.withdraw, this._id, {
        cylinderId
      });
    } else {
      throw ('Insufficient tokens');
    }
  },
  async purchaseTokens(quantity) {
    await this.update({
      tokens: this.tokens + quantity
    });
    return (this.tokens + quantity);
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  listAdmin({ skip = 0, limit = 50 } = {}) {
    return this.find({ scope: { $regex: 'admin', $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
