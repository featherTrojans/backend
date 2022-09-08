const { config } = require('../../config');
const { DoubleSpent, Webhook, Bills } = require('../../models');
const { services } = require('../../services');
const {logger, environment} = config
const { timeService } = services

// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{
        
        logger.info("mnig webhook called");
        const body = req.body
        // console.log(req.connection.remoteAddress)
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        Webhook.create({
            ip,
            data: JSON.stringify(body)
        })
        const {amount, userUid, description} = Bills.findOne({
            where: {reference: trans_id},
            attributes: ['amount', 'userUid', 'description']
        })
        const {

            username, status, trans_id, type

         } = body; //deconstruct
         if (environment == 'live') {
            if ( type != 'live' && ip != '::ffff:54.176.56.240') {
            
                // logger.info('Auth Token  not correct')
                logger.info("Unauthorized request")
                return res.status(403).json({
                    message: 'invalid request, unauthorized caller'
                })
            }
         }
         
        //get user_id with account_no

        if (username.toLowerCase() == 'featherafrica') {
            

            if ( !check ) {
                const updated = await Bills.update(
                    {where: {reference: trans_id}},
                    {status}
        
                )
                if (updated) {
                    //check status
                    if (status.toLowerCase() == 'failed' || status.toLowerCase() == 'cancelled'){
                        //refund user
                        

                        if ( isInteger(amount)  && amount > 0){
                            //reverse fund
                            let creditReference = 'FTHRVSL' + services.idGenService(6)
                            new Promise(function(resolve, reject) {
                                let reCredit = services.creditService({userUid, reference: creditReference, amount, from: 'pay bills', to: 'primary wallet', description: `${description} reversal `, title: 'Fund Reversal'})

                                reCredit ? setTimeout(() => resolve("done"), 9000) : setTimeout(() => reject( new Error(`Cannot re credit`)));
                            })
                        }
                        //move on
                    }
                    //move on
                }
                return res.status(200)
            } else {
                logger.info('double spending')
                return status(200).json({
                    message: "Double spent"
                })
            }
        } else {

            return res.status(403).json({
                message: "Unautorized request"
            })
        }
        
        
    } catch(error) {
        logger.info(error)
        return res.status(500).json({
            message: "Internal error"
        })
    }
    
});