'use strict';

//after were done, start making apps with superagent instead of express.
const request = require('superagent');
const User = require('../model/user.js');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

require('jest');

const PORT = process.env.PORT || 3001;
const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'exampleuser', 
  password: '1234',
  email: 'exampleuser@test.com',
};

describe('Authorization Routes', function() {

  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });


  //POST ROUTE TESTS

  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {

      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });

    describe('with invalid or no body', function() {
      it('should return a 400 status', done => {
        request.post(`${url}/api/signup`)
          .send({})
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });
  });


  //GET ROUTE TESTS

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {

      beforeEach( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            done();
          })
          .catch(done);
      });

      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });

      it('should return a token', done => {
        //for signin we need to have username and password as base64 string on authorization header
        request.get(`${url}/api/signin`)
          .auth('exampleuser', '1234')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });
    
    describe('with an invalid un/password', function() {
      it('should return a 401 status', done => {
        request.get(`${url}/api/signin`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
    });
  });
});