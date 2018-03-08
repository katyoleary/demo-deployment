'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');


const authRouter = require('./route/auth-router.js');
const collectionRouter = require('./route/collection-router.js');
const imageRouter = require('./route/image-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI); //using because thats what herokus gonna do. dont have to change this line when we push up

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(collectionRouter);
app.use(imageRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

server.isRunning = true;
