const Joi = require('joi');
const lockerState = require('../server/helpers/locker').state;

module.exports = {
  // LOGIN VALIDATION
  login: {
    body: {
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string().required()
    }
  },
  // USER VALIDATION
  createUser: {
    body: {
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string().required()
    }
  },
  updateUser: {
    body: {
      email: Joi.string().email({ minDomainAtoms: 2 }).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },
  // LOCKER VALIDATION
  createLocker: {
    body: {
      bluetoothAddress: Joi.string().required(),
      bluetoothPassword: Joi.string().min(6).max(6).required()
    }
  },
  updateLocker: {
    body: {
      bluetoothAddress: Joi.string().required(),
      bluetoothPassword: Joi.string().min(6).max(6).required(),
      state: Joi.string().valid(Object.values(lockerState)).required()
    }
  },
  // CYLINDER VALIDATION
  withdrawCylinder: {
    lockerId: Joi.string().required()
  },
  depositCylinder: {
    cylinderId: Joi.string().required(),
    lockerId: Joi.string().required()
  }
};
