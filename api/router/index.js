const express = require('express');
require('express-group-routes');
const router = express.Router();
const controller = require('../index').controller
const { body, validationResult } = require('express-validator');
const services = require("../../services").services
const Authenticate = services.Authenticate



router.group('/api/v1/', (router) => {
    router.get('/home', controller.home)


    router.group('/auth', (router) => {

        router.post('/signup', 
        [
            body('firstName').toUpperCase(),
            body('email').isEmail(),
            body('firstName').isLength({ min: 2 }),
            body('lastName').toUpperCase(),
            body('phoneNumber').isNumeric(),
            body('phoneNumber').isLength({ max: 11 }),
            body('email').toUpperCase(),

        ], 
        controller.signup
        );

        
        router.post('/verify/code',
        [   
            Authenticate,
            body('code').isNumeric(),
            body('code').isLength({ min: 6, max: 6 }),
            
        ], 
        controller.confirmCode
        );

    })
})


module.exports = router; 