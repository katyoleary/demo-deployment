'use strict';

const request = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

const User = require('../model/user.js');
const Collection = require('../model/collection.js');

require('jest');

const PORT = process.env.PORT || 3001;
const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com',
};

const exampleCollection = {
  name: 'test collection',
  desc: 'test collection description',
};

const updateCollection = {
  name: 'update collection', 
  desc: 'update collection description',
};

describe('Collection Routes', function() {
  
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Collection.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });


  //POST ROUTE TESTS


  describe('POST: /api/collection', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a collection', done => {
      request.post(`${url}/api/collection`)
        .send(exampleCollection)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(exampleCollection.desc);
          expect(res.body.name).toEqual(exampleCollection.name);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        }); 
    });

    it('should return a 401 if no token provided', done => {
      request.post(`${url}/api/collection`)
        .send(exampleCollection)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 400 error if no body provided', done => {
      request.post(`${url}/api/collection`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });

  //GET ROUTE TESTS

  describe('GET: /api/collection/:collectionId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleCollection.userID = this.tempUser._id.toString();
      new Collection(exampleCollection).save()
        .then( collection => {
          this.tempCollection = collection;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleCollection.userID;
    });

    it('should return a collection', done => {
      request.get(`${url}/api/collection/${this.tempCollection._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleCollection.name);
          expect(res.body.desc).toEqual(exampleCollection.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 401 if no token provided', done => {
      request.get(`${url}/api/collection/${this.tempCollection._id}`)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 404 if id not found', done => {
      request.get(`${url}/api/collection/`)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  //PUT ROUTE TESTS

  describe('PUT: /api/collection/:collectionId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleCollection.userID = this.tempUser._id.toString();
      new Collection(exampleCollection).save()
        .then( collection => {
          this.tempCollection = collection;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleCollection.userID;
    });

    it('should return a collection', done => {
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .send(updateCollection)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(updateCollection.desc);
          expect(res.body.name).toEqual(updateCollection.name);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 401 with no token', done => {
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .send(updateCollection)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 404 invalid id', done => {
      request.put(`${url}/api/collection/`)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should return a 400 error without a body', done => {
      request.put(`${url}/api/collection/${this.tempCollection._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });
});