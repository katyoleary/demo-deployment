'use strict';

const request = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

const Image = require('../model/image.js');
const User = require('../model/user.js');
const Collection = require('../model/collection.js');

require('jest');

const url = 'http://localhost:3001';

const exampleUser = {
  username: 'example user', 
  password: '1234', 
  email: 'exampleuser@test.com',
};

const exampleCollection = {
  name: 'ex collection', 
  desc: 'ex desc',
};

const exampleImage = {
  name: 'ex image',
  desc: 'ex image desc',
  image: `${__dirname}/../data/tester.png`,
};

describe('Image Routes', function () {
  
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Image.remove({}),
      User.remove({}),
      Collection.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });


  //POST ROUTE TESTS

  describe('POST: /api/collection/:collectionId/image', function() {
    describe('with a valid token and valid data', function() {
      beforeEach( done => {
        new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            return user.generateToken(); //returns a token so we can use below
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

      afterEach( done => {
        delete exampleCollection.userID;
        done();
      });

      it('should return an obj containing image url', done => {
        request.post(`${url}/api/collection/${this.tempCollection._id}/image`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })

          .field('name', exampleImage.name) //.field is props and their values on an object from superagent. 
          .field('desc', exampleImage.desc)
          .attach('image', exampleImage.image)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleImage.name);
            expect(res.body.desc).toEqual(exampleImage.desc);
            expect(res.body.collectionID).toEqual(this.tempCollection._id.toString());
            done();
          });
      });
    });
  });
});