const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const mongoose = require('mongoose');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## User with Authentication APIs', () => {
  const userCredentials = {
    user: {
      email: 'unit@testing.com',
      password: 'express'
    }
  };

  const invalidUserCredentials = {
    user: {
      email: 'wrongtest.com',
      password: 'wrong'
    }
  };

  let user = {};

  describe('# POST /api/users', () => {

    it('should create a new user with a valid token', (done) => {
      request(app)
        .post('/api/users')
        .send(userCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.email).to.equal(userCredentials.user.email);
          expect(res.body.user.Token).to.not.equal(null);
          jwt.verify(res.body.user.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line no-unused-expressions
            expect(decoded.email).to.equal(userCredentials.user.email);
            user = res.body.user;
            console.log(user);
            done();
          });
        });
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('it should get user details with token', (done) => {
      request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(user.email);
          expect(res.body.mobileNumber).to.equal(user.mobileNumber);
          done();
        })
        .catch(done);
    });

    it('should return Authentication error', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(invalidUserCredentials)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message)
            .to
            .equal('"email" must be a valid email');
          done();
        })
        .catch(done);
    });
  });

  it('should report error with message - Not found, when user does not exists', (done) => {
    request(app)
      .get('/api/users/56c787ccc67fc16ccc1a5e92')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(httpStatus.NOT_FOUND)
      .then((res) => {
        expect(res.body.message).to.equal('Not Found');
        done();
      })
      .catch(done);
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      user.email = 'unit-update@testing.com';
      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal('unit-update@testing.com');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all users (with limit and skip)', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${user.token}`)
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal('unit-update@testing.com');
          expect(res.body.mobileNumber).to.equal(user.mobileNumber);
          done();
        })
        .catch(done);
    });
  });
});

