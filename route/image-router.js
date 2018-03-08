'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk'); //software development kit
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cfgram:image-router');

const Image = require('../model/image.js');
const Collection = require('../model/collection.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const imageRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

//instantiates new S3 model object that has tons of methods on it that allow things like upload/delete/ etc. Docs take some time to get through. look at upload and delete object method
const s3 = new AWS.S3(); 
const dataDir = `${__dirname}/../data`; //where data initially uploaded in file system
const upload = multer({ dest: dataDir }); //tells multer where to go. (where our file is, and where to upload it) //https://stackoverflow.com/questions/4526273/what-does-enctype-multipart-form-data-mean

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data); //keeping err handling out bc s3 is weird sometimes
    });
  });
}

imageRouter.post('/api/collection/:collectionId/image', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/collection/:collectionId/image');

  //multer uploading a single image. takes all the parts of that file and deconstructs on file property
  if(!req.file) {
    return next(createError(400, 'file not found'));
  }

  if(!req.file.path) {
    return next(createError(400, 'file not saved'));
  }

  //path is builtin node module that lets us get pathnames 
  let ext = path.extname(req.file.originalname); //< has been given to us by multer. .png chillin right here

  let params = {
    ACL: 'public-read', //access control list.  we want everyone to see pics in our bucket
    Bucket: process.env.AWS_BUCKET, //putting env variable here let us have bucket thats local, staging, production, etc. any assets saved on staging are just staging assets for example.
    Key: `${req.file.filename}${ext}`, //multer added file prop to request. on that file prop theres a filename prop. we have to put the extension back on it
    Body: fs.createReadStream(req.file.path),
  };

  //creating ability to upload this file
  Collection.findById(req.params.collectionId) //find collection
    .then( () => s3uploadProm(params)) //then call s3Prom, pass it params so it knows what to upload and what bucket to upoload to
    .then( s3data => { //the obj we get back from s3 has tons of props
      del([`${dataDir}/*`]);

      //going to be some of the things s3 gave us back
      let imageData = {
        name: req.body.name, 
        desc: req.body.desc,
        objectKey: s3data.Key, //well be using this to delete obj from s3. s3data.key === s3data.Key. same same dunno y
        imageURI: s3data.Location, //points to where it lives. MUST have this
        userID: req.user._id,
        collectionID: req.params.collectionId,
      };

      return new Image(imageData).save();
    })

    .then( image => res.json(image))
    .catch( err => next(err));
});

