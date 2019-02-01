const Joi = require('joi');

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      user: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().required()
      }
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      email: Joi.string().regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/).required(),
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required(),
      password: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      user: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().required()
      }
    }
  }
};
