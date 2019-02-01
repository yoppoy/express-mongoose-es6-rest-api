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
      email: Joi.string().email({ minDomainAtoms: 2 }).required()
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
