const express = require('express'); //import express
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


const { config } = require('./config');
const Router = require('./api/router')


const expressLogger = config.expressLogger


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressLogger)
app.use('/', Router)


module.exports = app;
