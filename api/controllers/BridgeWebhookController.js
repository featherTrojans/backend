const { config } = require('../../config');
const { DoubleSpent, Webhook, Users, VfdPayment } = require('../../models');
const { services } = require('../../services');
const {logger, environment, bc_akey, bc_skey,} = config
const { timeService} = services

var AES256  = require('aes-everywhere');

exports.bridgeCardwebhook = (async (req, res) => {
    //validate event
    try{
        
        logger.info("bridge webhook called");
        const body = req.body
        // console.log(req.connection.remoteAddress)
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        webhookSecret = req.headers['X-Webhook-Signature']
        Webhook.create({
            ip,
            data: JSON.stringify(body)
        })

        // decryption
        var decrypted = AES256.decrypt( webhookSecret, bc_skey)
        console.log(decrypted);
        const {
            account_number, amount,reference,
            originator_account_number, originator_account_name,
            originator_bank, originator_narration, timestamp,
         } = body; //deconstruct
        const auth_token = req.headers['auth_token'];
        // console.log('headers', req.headers.auth_token)
        // console.log('auth_token', auth_token)
        // console.log('token', auth_token) // log token
         if (environment == 'live' && decrypted == false) {
            if ( (ip != '::ffff:35.178.240.72' && ip != '::ffff:191.101.42.78') ) {
            

                // logger.info('Auth Token  not correct')
                logger.info("Unauthorized request")
                return res.status(403).json({
                    message: 'invalid request, unauthorized caller'
                })
            }
         } else {
             return res.status(200).json({
                 status: true,
                 data: {},
                 Message: "Successfully retrieved"
             })
         }
         
        //get user_id with account_no
        // const {userUid} = await Users.findOne({
        //     where: {accountNo: account_number},
        //     attributes: ['userUid']

        // })
        // const check = await DoubleSpent.create({
        //     transId: reference,
        //     amount,
        //     username: userUid
        // })
        
        
    } catch(error) {
        logger.info(error)
        return res.status(500).json({
            message: "Internal error"
        })
    }
    
});