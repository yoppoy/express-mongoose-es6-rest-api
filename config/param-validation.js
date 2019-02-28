const Joi = require('joi');

module.exports = {
  // LOGIN VALIDATION
  login: {
    body: {
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .required()
    }
  },
  // USER VALIDATION
  createUser: {
    body: {
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .required()
    }
  },
  updateUser: {
    body: {
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required()
    },
    params: {
      userId: Joi.string()
        .hex()
        .required()
    }
  },
  // LOCKER VALIDATION
  createLocker: {
    body: {
      locker: {
        address: Joi.string()
          .required(),
        password: Joi.string()
          .min(6)
          .max(6)
          .required()
      }
    }
  }
};
