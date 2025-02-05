const express = require('express');
require('express-group-routes');
const router = express.Router();
const controller = require('../index').controller
const { body, validationResult } = require('express-validator');
const {Authenticate, LevelCheck} = require("../../services").services


router.group('/', (router) => {

    router.get('/', controller.docs);

    router.group('/api/v1/', (router) => {
        router.get('/home', controller.home)

        router.group('/agent', (router) => {
            router.post('/signup', [
                Authenticate,
                body('phone_number').isNumeric(),
                body('phone_number').isLength({ max: 11, min: 11 })
            ],
            controller.createAgent
            );

            router.post('/approve', controller.approveAgent)

            router.put('/data/update', [Authenticate], controller.completeAgentReg)

            router.put('/status/update', [Authenticate], controller.switchStatus)

            router.put('/location/update', [Authenticate], controller.updateLocation)

            router.get('/dashboard', [Authenticate], controller.agentDashboard)
        })
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

            router.post('/security/question/set',
            [   
                Authenticate,
                body('secQue1').isLength({min: 4}),
                body('secQue2').isLength({min: 4}),
                body('secAns1').isLength({min: 4}),
                body('secAns2').isLength({min: 4}),
                
            ], 
            controller.createSecurityQuestion
            );

            router.put('/password/set',
            [   
                Authenticate,
                // body('password').isAlphanumeric(),
                body('password').isLength({ min: 6 }),
                
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

            router.put('/data/update',
            [   
                Authenticate
                
            ], 
            controller.createProfile
            );

            router.post('/pin/verify',
            [   
                Authenticate,
                body('user_pin').isNumeric(),
                body('user_pin').isLength({ min: 4, max: 4 }),
                
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

            router.put('/password/changepassword',
            [   
                Authenticate,
                body('newpassword').isLength({ min: 6 }),

                
            ], 
            controller.changePassword
            );

            router.post('/signin',
            [   
                body('username').toLowerCase(),
                body('password').isLength({ min: 4 }),
                
            ], 
            controller.signIn
            );
            router.post('/signup/v2',
            [   
                body('username').toLowerCase()
                
            ], 
            controller.signUpTwo
            );
            router.post('/signin/v2',
            [   
                body('username').toLowerCase()
                
            ], 
            controller.signInTwo
            );
            router.post('/signin/confirm',
            [   
                body('code')
                
            ], 
            controller.confirmLoginCode
            );

            router.post('/signup/confirm',
            [   
                body('code')
                
            ], 
            controller.confirmRegisterCode
            );

            router.group('/agent', (router) => {

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
                controller.agentsignup
                );
    
                router.post('/resend/code',
                    controller.agentresendCode
                );
                
                router.post('/verify/code',
                [   
                    Authenticate,
                    body('code').isNumeric(),
                    body('code').isLength({ min: 6, max: 6 }),
                    
                ], 
                controller.agentconfirmCode
                );
    
                router.put('/password/set',
                [   
                    Authenticate,
                    // body('password').isAlphanumeric(),
                    body('password').isLength({ min: 6 }),
                    
                ], 
                controller.agentsetPassword
                );
    
                router.put('/pin/set',
                [   
                    Authenticate,
                    body('pin').isNumeric(),
                    body('pin').isLength({ min: 4, max: 4 }),
                    
                ], 
                controller.agentsetPin
                );
    
                router.post('/pin/verify',
                [   
                    Authenticate,
                    body('user_pin').isNumeric(),
                    body('user_pin').isLength({ min: 4, max: 4 }),
                    
                ], 
                controller.agentVerifyPin
                );
    
                // router.post('/token/create',
                // [   
                //     Authenticate
                // ], 
                // controller.agentcreateToken
                // );
    
                router.put('/username/set',
                [   
                    Authenticate,
                    body('newUsername').isLength({ min: 3 }),
                    body('newUsername').toUpperCase()
                    
                ], 
                controller.agentsetUsername
                );
    
                // router.put('/password/changepassword',
                // [   
                //     Authenticate,
                //     body('newpassword').isLength({ min: 6 }),
                    
                // ], 
                // controller.agentchangePassword
                // );
    
                router.post('/signin',
                [   
                    body('username').toLowerCase(),
                    body('password').isLength({ min: 4 }),
                    
                ], 
                controller.agentsignIn
                );
    
                
            })
    
        })

        router.get('/dashboard',
        [   
            Authenticate
            
        ], 
        controller.dashboard
        );
        router.get('/limitrange', [Authenticate], controller.limitData)

        router.post('/forgot/password', 
            controller.sendForgotPswdCode
        );
        router.put('/new/password',
            [Authenticate],
            controller.setNewPassword
        );


        router.get('/transactions',
        [   
            Authenticate
            
        ], 
        controller.getTransactions
        );

        router.get('/transactions/users/:phoneNumber',
        [   
            Authenticate
            
        ], 
        controller.transactionBtwUSers
        );

        router.get('/notifications',
        [   
            Authenticate
            
        ], 
        controller.getAllNotifications
        );

        router.post('/pay',
        [   
            Authenticate,
            LevelCheck
            
        ], 
        controller.makePayment
        );

        router.post('/pay/verify',
            controller.verifyPayment
        );

        router.post('/pay/webhook',
            controller.webhook
        );
        router.post('/request/webhook',
        controller.sendRequestWebhook
        );
        router.post('/card/webhook',
            controller.bridgeWebhok
        );
        router.post('/vfd/webhook',
            controller.vfdwebhook
        );
        router.post('/vfd/webhook/igree',
            controller.igreewebhook
        );
        router.post('/paybills/webhook',
            controller.mnig_webhook
        );
        router.post('/push/notification', 
            controller.sendPushNotif
        );
        router.post('/sms/notification', 
            controller.sendSmsNotif
        );
        router.post('/email/notification', 
        controller.sendEmailNotif
    )
        router.post('/transfer', [
            Authenticate,
            LevelCheck,
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
                LevelCheck,
                body('agent').toUpperCase(),
                body('agentUsername').toUpperCase(),
                
            ], 
            controller.createRequest
        );

        router.put('/request/accept/:reference',
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
                LevelCheck
            ], 
            controller.createStatus
        );

        router.put('/status/update',
            [   
                Authenticate,
                LevelCheck
            ], 
            controller.updateStatus
        );
        router.put('/status/location/update',
            [   
                Authenticate
            ], 
            controller.updateStatusLocation
        );

        router.get('/status/get',
            [   
                Authenticate, 
            ], 
            controller.getAllStatuses
        );

        router.post('/request/approve', 
            [Authenticate],
            controller.approveRequest
        );
        router.put('/request/negotiate', 
            [Authenticate],
            controller.createNegotiation
        );
        router.post('/rating', 
            [Authenticate],
            controller.rateUser
        );
        router.post('/status/find',
        [   
            Authenticate,
            LevelCheck
        ], 
        controller.findStatus
        );

        router.get('/merchant/detail/:username',
                [   
                    Authenticate,
                ], 
                controller.getMerchant
        );

        router.post('/merchant/transfer',
                [   
                    Authenticate,
                ], 
                controller.transferFundsToAgent
        );

        router.group('/user', (router) => {
            router.get('/:username',
                [   
                    Authenticate,
                ], 
                controller.users
            );
            router.get('/detail/:username',
                controller.getUserWtoutLog
            );
            router.post('/multiple', 
            [
                Authenticate
    
            ], 
                controller.getMultipleUser
            );

            router.post('/upgrade', 
            [
                Authenticate
    
            ], 
                controller.upgradeUser
            );
            router.post('/veteran/upgrade', 
            [
                Authenticate
    
            ], 
                controller.veteranUpgrade
            );

            router.post('/card/create',
                [ Authenticate ],
                controller.createCard
            );

            router.put('/card/fund',
                [ Authenticate ],
                controller.fundCard
            );

            router.get('/card/get',
                [ Authenticate ],
                controller.getCardDetails
            )

            router.post('/verify/upgrade', 
            [
                Authenticate
    
            ], 
                controller.confirmBvnCode
            );

            router.post('/account', 
            [
                Authenticate
    
            ], 
                controller.createCollectionAcc
            );

            router.post('/verify', 
            [
                Authenticate,
                body('bank_name').toUpperCase(),
                body('acc_num').isLength({ min: 10, max: 10 }),
                body('acc_num').isNumeric(),
                body('bank_name').isLength({ max: 11, min: 3 }),
                body('bvn').isNumeric()
    
            ], 
                controller.verifyUsers
            );
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
            
        });

        router.post('/withdraw', 
            [
                Authenticate,
                LevelCheck,
                body('amount').isLength({ min: 3, max: 8 }),
                body('amount').isNumeric(),



            ], 
                controller.withdraw
        );

        router.group('/balance', (router) => {
            router.get('/get', 
                [
                    Authenticate

                ], 
                    controller.getBalance
            );
        });

        router.group('/upload', (router) => {
            router.post('/image', 
                [
                    Authenticate
                ], 
                    controller.uploadFile
                );
        });


        router.group('/profile/update', (router) => {
            router.put('/basic',
                [   
                    Authenticate,
                ], 
                controller.updateBasicData
            );
            router.put('/personal',
                [   
                    Authenticate,
                ], 
                controller.updatePersonalData
            );
        });

        router.group('/bills', (router) => {
            router.post('/airtime',
                [   
                    Authenticate,
                ], 
                controller.buyAirtime
            );
            router.post('/electricity',
                [   
                    Authenticate,
                ], 
                controller.buyElect
            );
            router.get('/all',
            [   
                Authenticate,
            ], 
            controller.getAllBills
            );

            router.get('/prices/:package', [Authenticate], controller.cablePrices)
            router.post('/details', [Authenticate], controller.cableDetails)
            router.post('/subscribe', [Authenticate], controller.cableSub)
        });
        router.get('/usd/rate', controller.getUsdRate)
        router.get('/beneficiary/get/:type',[Authenticate], controller.getBeneficiary);
        router.post('/beneficiary/create',[Authenticate], controller.createBeneficiary)
        router.get('/admin/stats', controller.stats);
        router.get('/referral/stats/:referredBy', controller.referralStats);
        router.get('/cron', controller.cronJob);
        router.group('/admin', (router) => {
            router.post('/marketer/make', controller.makeMarketer)
            router.get('/users/email', controller.userEmailControllers)
        });
    })
})


module.exports = router;