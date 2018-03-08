'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = Schema({
  name: { type: String, required: true }, 
  desc: { type: String, required: true },
  //required for date doesnt really need to be there, but were putting it there for other developers
  created: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model('collection', collectionSchema);
