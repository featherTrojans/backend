const { config } = require('../../config');
const { DoubleSpent, Webhook, Users, VfdPayment } = require('../../models');
const { services } = require('../../services');
const {logger, environment} = config
const { timeService} = services

// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{
        
        logger.info("Vfd webhook called");
        const body = req.body
        // console.log(req.connection.remoteAddress)
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        Webhook.create({
            ip,
            data: JSON.stringify(body)
        })
        const {
            account_number, amount,reference,
            originator_account_number, originator_account_name,
            originator_bank, originator_narration, timestamp,
         } = body; //deconstruct
        const auth_token = req.headers['auth_token'];
        // console.log('headers', req.headers.auth_token)
        // console.log('auth_token', auth_token)
        // console.log('token', auth_token) // log token
         if (environment == 'live') {
            if ( (ip != '::ffff:35.178.240.72' && ip != '::ffff:191.101.42.78') && auth_token != 'VfdFeatheR$%$' ) {
            

                // logger.info('Auth Token  not correct')
                logger.info("Unauthorized request")
                return res.status(403).json({
                    message: 'invalid request, unauthorized caller'
                })
            }
         }
         
        //get user_id with account_no
        const {userUid} = await Users.findOne({
            where: {accountNo: account_number},
            attributes: ['userUid']

        })
        const check = await DoubleSpent.create({
            transId: reference,
            amount,
            username: userUid
        })

        if (userUid && userUid != null) {
            const uploadPayment = await VfdPayment.create({
                reference,
                userUid,
                amount,
                account_number,
                originator_account_number,
                originator_account_name,
                originator_bank,
                originator_narration,
                timestamp
            })

            if ( !check ) {
                logger.info('Already used')
                return res.status(200)
            } else {
    
                if ( !uploadPayment ) {
    
                    logger.info(`previously credited ${reference}`)
                    return  res.status(400).json({
                        message: 'previously credited'
                    });
                    
                } else {
    
                    //credit user
                    services.creditService({userUid, reference, amount, description: originator_narration,from: `${originator_account_name} - ${originator_account_number},`, to: "primary wallet" })
                    return res.status(200).json({
                        message: 'credited successfully'
                    });
    
                }
            }
        } else {

            logger.info("Account does not belong to any user")
            VfdPayment.create({
                reference,
                userUid: `${timeService.serverTime().timeToUse}noUser${account_number}` ,
                amount,
                account_number,
                originator_account_number,
                originator_account_name,
                originator_bank,
                originator_narration,
                timestamp
            })
            return res.status(404).json({
                message: "Account does not belong to any user"
            })
        }
        
        
    } catch(error) {
        logger.info(error)
        return res.status(500).json({
            message: "Internal error"
        })
    }
    
});