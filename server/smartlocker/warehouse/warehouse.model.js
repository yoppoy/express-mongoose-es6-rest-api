const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');
const User = require('../../user/user.model');

/**
 * Warehouse Schema
 */
const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: [Number],
    required: true
  },
  lockers: {
    type: [mongoose.Schema.Types.ObjectId]
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
WarehouseSchema.method({
});

/**
 * Statics
 */
WarehouseSchema.statics = {
  /**
   * Get warehouse
   * @param {ObjectId} id - The objectId of warehouse.
   * @returns {Promise<Warehouse, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((warehouse) => {
        if (warehouse) {
          return warehouse;
        }
        const err = new APIError('No such warehouse exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List warehouses in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of warehouses to be skipped.
   * @param {number} limit - Limit number of warehouses to be returned.
   * @returns {Promise<Warehouse[]>}
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
 * @typedef Warehouse
 */
module.exports = mongoose.model('Warehouse', WarehouseSchema);
