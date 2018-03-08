'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const User = require('../model/user.js');
const createError = require('http-errors');

const authRouter = module.exports = Router(); //can still instantiate new Router without using new keyword

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');
  
  if(!req.body.username || !req.body.password) {
    return next(createError(400, 'username and password required'));
  }

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => res.send(token))
  //this token is to authorize us into future routes that we need a token to access.
    .catch(next);
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  User.findOne({ username: req.auth.username }) //comes from basicAuth (req.auth.username)
    .then( user => user.comparePasswordHash(req.auth.password)) //checking this password, hashing it and comparing it to the database
    .then( user => user.generateToken()) //
    .then( token => res.send(token))
    .catch(next);
});

//PURPOSE OF SIGNUP AND SIGN IN IT TO GET  TOKEN AND ACCESS ROUTES OF YOUR APPPPPPPPPP
//base64 access only generated to create a token, which is secure. can't use this for anything else



