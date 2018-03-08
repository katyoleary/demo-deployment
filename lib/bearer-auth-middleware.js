'use strict';

//following same general mold as basic auth middleware. except were just grabbing the token instead of un/password

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('cfgram:bearer-auth-middleware');

const User = require('../model/user.js');

//OBV a piece of route level middleware bc of this signature
module.exports = function(req, res, next) { 
  debug('bearer auth');

  // let/var have scoping differences. Let = block scoping. If we're doing reassignment we should probably be using var
  var authHeader = req.headers.authorization; 

  //if we have brackets, HAVE TO USE RETURN
  if(!authHeader) { 
    return next(createError(401, 'auth header required'));
  }

  //bearer _ token ( _ = space )
  var token = authHeader.split('Bearer ')[1]; 
  if(!token) {
    return next(createError(401, 'token required'));
  }

  //this is the two way auth piece. 
  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if (err) return next(err);

    User.findOne({ findHash: decoded.token })
      .then( user => {
        //taking user and applying the user to the request along with the token. one of the things the user has is the _id prop
        req.user = user;
        next();
      })
      .catch( err => {
        return next(createError(401, err.message));
      });
  });
};


// 