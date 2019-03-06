process.env.NODE_ENV = 'test';

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const mongoose = require('mongoose');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.db.dropDatabase();
  mongoose.connection.close();
  done();
});

describe('User', () => {
  const user1Cred = {
    email: 'unit@testing.com',
    password: 'express'
  };
  const user2Cred = {
    email: 'unit2@testing.com',
    password: 'express'
  };
  const adminCred = {
    email: 'unit@testing.com',
    password: 'express'
  };
  const invalidUserCred = {
    email: 'wrongtest.com',
    password: 'wrong'
  };
  let user = {};
  let user2 = {};
  let admin = {};

  it('should create 2 new users with a valid token', (done) => {
    request(app)
      .post('/api/user')
      .send(user1Cred)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.user.email).to.equal(user1Cred.email);
        expect(res.body.token).to.not.equal(null);
        jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
          expect(err).to.not.be.ok; // eslint-disable-line
          expect(decoded.email).to.equal(user1Cred.email);
          user = res.body.user;
          user.token = res.body.token;
          request(app).post('/api/user')
            .send(user2Cred)
            .expect(httpStatus.OK)
            .then((res1) => {
              expect(res1.body.user.email)
                .to
                .equal(user2Cred.email);
              expect(res1.body.token)
                .to
                .not
                .equal(null);
              user2 = res1.body.user;
              user2.token = res1.body.token;
              done();
            })
            .catch(done);
        });
      })
      .catch(done);
  });

  it('it should get user details with token', (done) => {
    request(app)
      .get(`/api/user/${user._id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.email)
          .to
          .equal(user.email);
        expect(res.body.mobileNumber)
          .to
          .equal(user.mobileNumber);
        done();
      })
      .catch(done);
  });

  it('should return Authentication error', (done) => {
    request(app)
      .post('/api/login')
      .send(invalidUserCred)
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body.message)
          .to
          .equal('"email" must be a valid email');
        done();
      })
      .catch(done);
  });

  it('should report error with message - Not found, when user does not exists', (done) => {
    request(app)
      .get('/api/user/56c787ccc67fc16ccc1a5e92')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(httpStatus.NOT_FOUND)
      .then((res) => {
        expect(res.body.message)
          .to
          .equal('Not Found');
        done();
      })
      .catch(done);
  });

  it('should return Forbidden for normal user : GET / PUT / DELETE', (done) => {
    request(app)
      .get(`/api/user/${user2._id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .then((res1) => {
        expect(res1.body.message).to.equal('Forbidden');
        request(app)
          .put(`/api/user/${user2._id}`)
          .set('Authorization', `Bearer ${user.token}`)
          .send(user2Cred)
          .then((res2) => {
            expect(res2.body.message)
              .to
              .equal('Forbidden');
            request(app)
              .delete(`/api/user/${user2._id}`)
              .set('Authorization', `Bearer ${user.token}`)
              .then((res3) => {
                expect(res3.body.message)
                  .to
                  .equal('Forbidden');
                done();
              });
          })
          .catch(done);
      })
      .catch(done);
  });

  it('should update user details', (done) => {
    user.email = 'unit-update@testing.com';
    request(app)
      .put(`/api/user/${user._id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send(user)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.email)
          .to
          .equal('unit-update@testing.com');
        done();
      })
      .catch(done);
  });

  it('should delete user 1', (done) => {
    request(app)
      .delete(`/api/user/${user._id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.email)
          .to
          .equal(user.email);
        done();
      })
      .catch(done);
  });

  describe('Admin', () => {
    it('should create an admin', (done) => {
      const initialAdmin = new User({
        email: 'admin@test.gmail',
        scope: 'admin'
      });

      request(app)
        .post('/api/admin')
        .send(adminCred)
        .set('Authorization', `Bearer ${initialAdmin.generateJWT()}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.email).to.equal(user1Cred.email);
          expect(res.body.token).to.not.equal(null);
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line
            expect(decoded.email).to.equal(user1Cred.email);
            admin = res.body.user;
            admin.token = res.body.token;
            done();
          });
        })
        .catch(done);
    });

    it('should get all users', (done) => {
      request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all users (with limit and skip)', (done) => {
      request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${admin.token}`)
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should delete user 2', (done) => {
      request(app)
        .delete(`/api/user/${user2._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email)
            .to
            .equal(user2.email);
          done();
        })
        .catch(done);
    });
  });
});
