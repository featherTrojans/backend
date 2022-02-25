var crypto = require('crypto');
const { config } = require('../../config');
const { Payments } = require('../../models');
const { services } = require('../../services');
var secret = config.paystack_secret_key;
const logger = config.logger
// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{
        logger.info('payment webhook called');
        logger.info(req.body);
        var hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            var data = req.body;
            // Do something with event 
            if ( data.event == 'charge.success') {

                const {reference} = data.data
                
                // get payment data
                const {amount, userUid, isUsed} = await Payments.findOne({attributes: ['amount', 'userUid'], where: {transId: reference}})
                //update payment
                await Payments.update({expired: true, isUsed: true}, {
                    where: {transId: reference}
                })
                if ( isUsed) {
                    return logger.info(`previously credited ${reference}`)
                } else {

                    //get user wallet balance
                    await services.creditService({userUid, reference, amount})
                    return res.sendStatus(200);
                }


            } else {
                logger.info("webhook not used");
                return res.sendStatus(200);
            }
        }
        logger.info("webhook not useful");
        res.sendStatus(200);
    } catch(error) {
        logger.debug(error)
        return res.sendStatus(200)
    }
    
});