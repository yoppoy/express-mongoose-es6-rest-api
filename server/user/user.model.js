const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

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
  cylinders: {
    type: [String]
  },
  tokens: {
    type: Number,
    default: 0
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
  async depositCylinder(cylinder) {
    try {
      console.log("Depositting :", cylinder._id);
      console.log("CREATING EVENT");
      //TODO add event to user await this.udpate({});
    } catch (e) {
      return (new APIError(e, httpStatus.BAD_REQUEST));
    }
  },
  async purchaseCylinder(cylinder) {
    try {
      if (this.tokens >= 1) {
        await this.update({ tokens: this.tokens - 1 });
        return (this.tokens - 1);
      } else {
        return (new APIError('Insufficient tokens', httpStatus.BAD_REQUEST));
      }
    } catch (e) {
      return (new APIError(e, httpStatus.BAD_REQUEST));
    }
  },
  async purchaseTokens(quantity) {
    try {
      await this.update({ tokens: this.tokens + quantity });
      return (this.tokens + quantity);
    } catch (e) {
      return (new APIError(e, httpStatus.BAD_REQUEST));
    }
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
