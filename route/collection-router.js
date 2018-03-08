'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:collection-router');
//dont have to call in mongoose because were requiring in Collection, which is based on a mongoose model

const Collection = require('../model/collection.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const collectionRouter = module.exports = Router();

//POST ROUTE

collectionRouter.post('/api/collection', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/collection');

  //_id from bearer auth middleware
  req.body.userID = req.user._id; 
  new Collection(req.body).save()
    .then( collection => res.json(collection))
    .catch(next);
});

//GET ROUTE

collectionRouter.get('/api/collection/:collectionId', bearerAuth, function(req, res, next) {
  debug('GET: /api/collection/:collectionId');
  
  Collection.findById(req.params.collectionId)
    .then( collection => res.json(collection))
    .catch(next);
});

//PUT ROUTE

collectionRouter.put('/api/collection/:collectionId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/collection/:collectionId');
  if(!req.params.collectionId) {
    res.status(404).send();
  }

  if(!req.body.name) return next(createError(400, 'no name provided'));
  if(!req.body.desc) return next(createError(400, 'no description provided'));

  Collection.findByIdAndUpdate(req.params.collectionId, req.body, { new: true })
    .then( collection => res.json(collection))
    .catch( err => {
      if (err.name === 'ValidationError') return next(err);
      next(createError(404, err.message));
    });
});

//DELETE ROUTE

collectionRouter.delete('/api/collection/:collectionId', function(req, res, next){
  debug('DELETE: /api/collection/:collectionId');

  Collection.findByIdAndRemove(req.params.collectionId)
    .then( () => res.status(204).send())
    .catch( err => next(createError(404, err.message)));
});