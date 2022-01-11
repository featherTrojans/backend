const express = require('express');
require('express-group-routes');
const router = express.Router();
const controller = require('../index').controller
const { body, validationResult } = require('express-validator');



router.group('/api/v1/', (router) => {
    router.get('/home', controller.home)


    router.group('/auth', (router) => {
        router.post('/signup', 
        [
            body('username').toUpperCase(),
            body('email').isEmail(),
            body('password').isLength({ min: 6 }),
            body('username').isLength({ min: 4 }),
            body('fullName').toUpperCase(),
            body('phoneNumber').isNumeric(),
            body('phoneNumber').isLength({ max: 11 }),
            body('email').toUpperCase(),

        ], controller.signup)
    })
})


module.exports = router; 