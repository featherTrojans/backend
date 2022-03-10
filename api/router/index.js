const express = require('express');
require('express-group-routes');
const router = express.Router();
const controller = require('../index').controller
const { body, validationResult } = require('express-validator');
const {Authenticate} = require("../../services").services


router.group('/', (router) => {

    router.get('/', controller.docs);

    router.group('/api/v1/', (router) => {
        router.get('/home', controller.home)


        router.group('/auth', (router) => {

            router.post('/signup', 
            [
                body('firstName').toUpperCase(),
                body('email').isEmail(),
                body('firstName').isLength({ min: 2 }),
                body('lastName').isLength({ min: 2 }),
                body('lastName').toUpperCase(),
                body('phoneNumber').isNumeric(),
                body('phoneNumber').isLength({ max: 11, min: 11 }),
                body('email').toUpperCase(),

            ], 
            controller.signup
            );

            router.post('/resend/code',
                controller.resendCode
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

            router.post('/pin/verify',
            [   
                Authenticate,
                body('pin').isNumeric(),
                body('pin').isLength({ min: 4, max: 4 }),
                
            ], 
            controller.verifyPin
            );

            router.post('/token/create',
            [   
                Authenticate
            ], 
            controller.createToken
            );

            router.put('/username/set',
            [   
                Authenticate,
                body('newUsername').isLength({ min: 3 }),
                body('newUsername').toUpperCase()
                
            ], 
            controller.setUsername
            );

            router.post('/signin',
            [   
                body('username').toLowerCase(),
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

        router.get('/transactions',
        [   
            Authenticate
            
        ], 
        controller.getTransactions
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
            body('userPin').isNumeric(),
            body('userPin').isLength({ min: 4, max: 4}),
        ], controller.transferFunds);

        router.get('/request/pending',
        [   
            Authenticate
            
        ], 
        controller.pendingRequests
        );

        router.get('/request/accepted',
        [   
            Authenticate
            
        ], 
        controller.acceptedRequests
        );

        router.get('/request/depositor/pending',
        [   
            Authenticate
            
        ], 
        controller.getDepPendingRequests
        );

        router.get('/request/depositor/accepted',
        [   
            Authenticate
            
        ], 
        controller.getDepAcceptedRequests
        );

        router.delete('/request/cancel',
            [   
                Authenticate,
                body('reasonForCancel').isLength({ min: 10 }),
                body('reasonForCancel').toUpperCase()
                
            ], 
            controller.cancelRequest
        );

        router.post('/request/create',
            [   
                Authenticate,
                body('agent').toUpperCase(),
                body('agentUsername').toUpperCase(),
                
            ], 
            controller.createRequest
        );

        router.put('/request/mark/:reference',
            [   
                Authenticate,
            ], 
            controller.markRequest
        );

        router.get('/request/status/:reference',
            [   
                Authenticate,
            ], 
            controller.getRequestStatus
        );

        router.post('/status/create',
            [   
                Authenticate, 
            ], 
            controller.createStatus
        );

        router.post('/request/approve', 
            [Authenticate],
            controller.approveRequest
        );
        router.put('/request/negotiate', 
            [Authenticate],
            controller.createNegotiation
        );
        router.post('/status/find',
        [   
            Authenticate,
        ], 
        controller.findStatus
        );
        router.group('/user', (router) => {
            router.get('/:username',
                [   
                    Authenticate,
                ], 
                controller.users
            )
        });

        router.group('/account', (router) => {
            router.post('/get', 
                [
                    Authenticate,
                    body('bank_name').toUpperCase(),
                    body('account_number').isLength({ min: 10, max: 10 }),
                    body('account_number').isNumeric(),
                    body('bank_name').isLength({ max: 11, min: 3 }),


                ], 
                    controller.getAccount
                );
        });

        router.group('/withdraw', (router) => {
            router.post('/', 
                [
                    Authenticate,
                    body('amount').isLength({ min: 3, max: 8 }),
                    body('amount').isNumeric(),


                ], 
                    controller.withdraw
                );
        });

        router.group('/balance', (router) => {
            router.get('/get', 
                [
                    Authenticate

                ], 
                    controller.getBalance
                );
        });
    
    })
})


module.exports = router; 