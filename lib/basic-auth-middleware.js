'use strict';

//if you understand this file, you'll have no barrier to understanding middleware files tomorrow. study this shit

const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware');


//this intercepts the request
module.exports = function(req, res, next) {
  debug('basic auth');

  //checking if we have auth header =>
  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'authorization header required'));
  }

  //if so, grab our base64 encoded string
  var base64str = authHeader.split('Basic ')[1];
  if (!base64str) {
    return next(createError(401, 'username and password required'));
  }

  //turn it into a buffer, then into an array
  var utf8str = Buffer.from(base64str, 'base64').toString();
  var authArr = utf8str.split(':');

  //attach an auth property to our request. (will use later in routes)
  req.auth = {
    username: authArr[0], 
    password: authArr[1],
  };

  //make sure username and password are applied
  if (!req.auth.username) {
    return next(createError(401, 'username required'));
  }

  if (!req.auth.password) {
    return next(createError(401, 'password required'));
  }

  next();
};