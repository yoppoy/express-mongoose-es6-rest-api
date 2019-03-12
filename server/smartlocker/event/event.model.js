const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../helpers/APIError');

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
  data: {
    type: Object
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

  create(type, user, data) {
    const event = new this({
      type, user, data
    });

    return new Promise((resolve, reject) => {
      event.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },
  /**
   * List event in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of event to be skipped.
   * @param {number} limit - Limit number of event to be returned.
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
