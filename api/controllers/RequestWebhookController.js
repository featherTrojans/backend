const { config } = require('../../config');
const { DoubleSpent, Webhook, Users, Request } = require('../../models');
const { services } = require('../../services');
const {logger, environment} = config
const { creditService} = services
const refundUser = require('../../services/middlewares/refundUser')
require('../../subscribers')

// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{
        
        logger.info("request webhook called");
        const body = req.body
        // console.log(req.connection.remoteAddress)
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        Webhook.create({
            ip,
            data: JSON.stringify(body)
        })
        const {
            reference,
            agreedCharge,
            status,
            reasonForCancel
         } = body; //deconstruct
        //  console.log("body: ", body)
         if (environment == 'live') {
            if ( (ip != '::ffff:54.204.199.73' && ip != '::ffff:191.101.42.78') ) {

                // logger.info('Auth Token  not correct')
                logger.info("Unauthorized request")
                return res.status(403).json({
                    message: 'invalid request, unauthorized caller'
                })
            }
         }
         const request = await Request.findOne({
            where: {reference},
            attributes: ['userUid', 'amount']

        })
        let {userUid, amount} = request
        if ( request.status != 'PENDING' && request.status != 'ACCEPTED'){
            return res.status(403).json({
                status: false,
                data: {rqMessage: 'request not pending'},
                message: "Request already treated... "
            })
        } else if (userUid != null){

            
             if (status == 'SUCCESS'){
                 //get user_id with reference
    
                // totalAmount = parseFloat(amount) + parseFloat(agreedCharge)
    
                // const check = await DoubleSpent.create({
                //     transId: reference,
                //     amount: totalAmount,
                //     username: userUid
                // })
                // Request.update({status, charges: agreedCharge, total: totalAmount}, {where: {
                //     reference, 
                //     status: ["PENDING", "ACCEPTED"]
                //    }})
                // if (userUid && userUid != null) {
                    
    
                //     if ( !check ) {
                //         logger.info('Already used')
                //         return res.status(200).json({
                //             message: 'Already credited'
                //         })
                //     } else {
                //         //update charge
                //         //credit user
                //         creditService({userUid, reference, amount: totalAmount, description: `cash withdrawal from refunded`})
                //         return res.status(200).json({
                //             message: 'credited successfully'
                //         });
            
                        
                //     }
                // } else {
                //     return res.status(404).json({
                //         message: "Request does not belong to any user"
                //     })
                // }
             } else if (status == 'CANCELLED') {

                Request.update({status, reasonForCancel}, {where: {
                    reference, 
                    status: ["PENDING", "ACCEPTED"]
                   }})
                   await refundUser(reference)
                 //update request status
                eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal has been cancelled`, redirectTo: 'Notifications'})
                return res.status(202).json({
                    message: "Updated successfully (CANCELLED)"
                })
    
             } else {
                 console.log('ongoing request...')
                 return  res.status(200).json({
                    message: "Request ongoing..."
                })
             }
             
        } else {
            return  res.status(404).json({
                message: "Request not found..."
            })
        }
         
        
        
        
    } catch(error) {
        logger.info(error)
        return res.status(500).json({
            message: "Internal error"
        })
    }
    
});