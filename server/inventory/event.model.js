const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const User = require('../user/user.model');

/**
 * Event Schema
 */
const EventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: [Number]
  },
  values: {
    type: [String]
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
EventSchema.method({
});

/**
 * Statics
 */
EventSchema.statics = {
  /**
   * Get event
   * @param {ObjectId} id - The objectId of event.
   * @returns {Promise<Event, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((event) => {
        if (event) {
          return event;
        }
        const err = new APIError('No such event exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List events in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of events to be skipped.
   * @param {number} limit - Limit number of events to be returned.
   * @returns {Promise<Event[]>}
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
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema);
