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
  // INVENTORY
  purchaseTokens: {
    body: {
      quantity: Joi.number().required
    }
  },
  // LOCKER VALIDATION
  createLocker: {
    body: {
      bluetoothAddress: Joi.array().min(6).max(6).required(),
      bluetoothPassword: Joi.string().min(6).max(6).required()
    }
  },
  updateLocker: {
    body: {
      bluetoothAddress: Joi.array().min(6).max(6).required(),
      bluetoothPassword: Joi.string().min(6).max(6).required(),
      state: Joi.string().valid(Object.values(lockerState)).required(),
      content: Joi.string().required(),
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
