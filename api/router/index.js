const express = require('express');
const router = express.Router();
const controller = require('../index').controller

router.get('/home', controller.home)

module.exports = router; 