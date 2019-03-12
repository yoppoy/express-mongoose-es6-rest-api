const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');
const User = require('../../user/user.model');

/**
 * Cylinder Schema
 */
const CylinderSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true
  },
  filled: {
    type: Boolean,
    default: true
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
CylinderSchema.method({
});

/**
 * Statics
 */
CylinderSchema.statics = {
  /**
   * Get cylinder
   * @param {ObjectId} id - The objectId of cylinder.
   * @returns {Promise<Cylinder, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((cylinder) => {
        if (cylinder) {
          return cylinder;
        }
        const err = new APIError('No such cylinder exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByBarcode(barcode) {
    return this.findOne({ barcode })
      .exec()
      .then((cylinder) => {
        if (cylinder) {
          return cylinder;
        }
        const err = new APIError('No such cylinder exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  findOneOrCreate(barcode) {
    let newCylinder;

    return this.findOne({ barcode }).exec().then((cylinder) => {
      if (cylinder) {
        return cylinder;
      }
      newCylinder = new this({ barcode, filled: false });
      return (this.create(newCylinder).then((created) => {
        return created;
      }).catch(e => e));
    });
  },

  /**
   * List cylinders in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of cylinders to be skipped.
   * @param {number} limit - Limit number of cylinders to be returned.
   * @returns {Promise<Cylinder[]>}
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
 * @typedef Cylinder
 */
module.exports = mongoose.model('Cylinder', CylinderSchema);
