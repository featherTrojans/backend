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

        router.put('/password/set',
        [   
            Authenticate,
            body('password').isAlphanumeric(),
            body('password').isLength({ min: 8 }),
            
        ], 
        controller.setPassword
        );

        router.put('/pin/set',
        [   
            Authenticate,
            body('pin').isNumeric(),
            body('pin').isLength({ min: 4, max: 4 }),
            
        ], 
        controller.setPin
        );

        router.put('/username/set',
        [   
            Authenticate,
            body('newUsername').isLength({ min: 4 }),
            body('newUsername').toUpperCase()
            
        ], 
        controller.setUsername
        );

        router.post('/signin',
        [   
            body('username').toUpperCase(),
            body('password').isLength({ min: 4 }),
            
        ], 
        controller.signIn
        );
    })

    router.get('/dashboard',
    [   
        Authenticate
        
    ], 
    controller.dashboard
    );

    router.post('/pay',
    [   
        Authenticate
        
    ], 
    controller.makePayment
    );

    router.post('/pay/verify',
        controller.verifyPayment
    );

    router.post('/pay/webhook',
        controller.webhook
    );
    router.post('/transfer', [
        Authenticate,
        body('transferTo').toUpperCase(),
    ], controller.transferFunds);
})


module.exports = router; 