const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const mongoose = require('mongoose');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Cylinder = require('../inventory/cylinder.model');
const Locker = require('../locker/locker.model');
const lockerState = require('../helpers/locker').state;

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

describe('## Locker testing', () => {
  const cylinderBarcode = 'B6700a';
  let cylinderId;
  let user = {};
  let admin = {};
  let locker = {};

  describe('Create users', () => {
    const userCredentials = {
      email: 'unit@testing.com',
      password: 'express'
    };

    it('should create a new user with a valid token', (done) => {
      request(app)
        .post('/api/user')
        .send(userCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.email).to.equal(userCredentials.email);
          expect(res.body.user.Token).to.not.equal(null);
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line no-unused-expressions
            expect(decoded.email).to.equal(userCredentials.email);
            user = res.body.user;
            user.token = res.body.token;
            done();
          });
        });
    });
    it('should create an admin', (done) => {
      const initialAdmin = new User({
        email: 'admin@test.gmail',
        scope: 'admin'
      });
      const adminCred = {
        email: 'admin@testing.com',
        password: 'express'
      };

      request(app)
        .post('/api/admin')
        .send(adminCred)
        .set('Authorization', `Bearer ${initialAdmin.generateJWT()}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.email).to.equal(adminCred.email);
          expect(res.body.token).to.not.equal(null);
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok;
            expect(decoded.email).to.equal(adminCred.email);
            admin = res.body.user;
            admin.token = res.body.token;
            done();
          });
        })
        .catch(done);
    });
  });
  describe('Create lockers', () => {
    const lockerCred = {
      bluetoothAddress: [100, 100, 100, 100, 100, 100],
      bluetoothPassword: '123456'
    };

    it('admin should create a new locker', (done) => {
      request(app)
        .post('/api/locker')
        .set('Authorization', `Bearer ${admin.token}`)
        .send(lockerCred)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.locker.bluetoothAddress).to.be.an('array');
          expect(res.body.locker.bluetoothPassword).to.equal(lockerCred.bluetoothPassword);
          expect(res.body.locker.state).to.equal(lockerState.open);
          locker = res.body.locker;
          done();
        });
    });

    it('user should deposit a cylinder inside a new locker', (done) => {
      request(app)
        .post('/api/locker/deposit')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          lockerId: locker._id,
          cylinderId: cylinderBarcode
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        });
    });

    it('Cylinder is created and empty', (done) => {
      Cylinder.getByBarcode(cylinderBarcode).then((cylinder) => {
        console.log("cylinder : ", cylinder);
        expect(cylinder.barcode).to.equal(cylinderBarcode);
        expect(cylinder.filled).to.equal(false);
        cylinderId = cylinder._id;
        done();
      });
    });

    it('Locker is locked and contains created cylinder', (done) => {
      Locker.get(locker._id).then((locker) => {
        console.log('Locker content ', locker.content);
        console.log('Cylinder       ', cylinderId);
        expect(locker.state).to.equal(lockerState.closed);
        expect(locker.content).to.deep.equal(cylinderId);
        done();
      });
    });

    it('should refuse because user has no tokens', (done) => {
      request(app)
        .post('/api/locker/withdraw')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          lockerId: locker._id
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        });
    });

   it('user should pay for 1 token and withdraw the deposited cylinder from a locker', (done) => {
      request(app)
        .post('/api/inventory/tokens/purchase')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          quantity: 1
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.tokens).to.equal(1);
          request(app)
            .post('/api/locker/withdraw')
            .set('Authorization', `Bearer ${user.token}`)
            .send({
              lockerId: locker._id
            })
            .expect(httpStatus.OK)
            .then((res) => {
              done();
            });
        });
    });

    it('normal users shouldn\'t be able create/list/update/delete a new locker', (done) => {
      request(app)
        .post('/api/locker')
        .set('Authorization', `Bearer ${user.token}`)
        .send(lockerCred)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.message).to.equal('Forbidden');
          request(app)
            .get('/api/locker/')
            .set('Authorization', `Bearer ${user.token}`)
            .expect(httpStatus.FORBIDDEN)
            .then((res1) => {
              expect(res1.body.message).to.equal('Forbidden');
              request(app)
                .get(`/api/locker/${locker._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(httpStatus.FORBIDDEN)
                .then((res2) => {
                  expect(res2.body.message).to.equal('Forbidden');
                  request(app)
                    .put(`/api/locker/${locker._id}`)
                    .send(lockerCred)
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(httpStatus.FORBIDDEN)
                    .then((res3) => {
                      expect(res3.body.message).to.equal('Forbidden');
                      request(app)
                        .delete(`/api/locker/${locker._id}`)
                        .set('Authorization', `Bearer ${user.token}`)
                        .expect(httpStatus.FORBIDDEN)
                        .then((res4) => {
                          expect(res4.body.message).to.equal('Forbidden');
                          done();
                        });
                    });
                });
            });
        });
    });
  });
});
