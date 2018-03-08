'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = Schema({
  name: { type: String, required: true }, 
  desc: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  collectionID: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true }, 
  objectKey: { type: String, required: true, unique: true }, //some funky bullshit
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('image', imageSchema);

