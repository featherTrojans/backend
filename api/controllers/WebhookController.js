var crypto = require('crypto');
const { config } = require('../../config');
const { Payments, Withdrawal, DoubleSpent } = require('../../models');
const { services } = require('../../services');
const creditService = require('../../services/middlewares/creditService');
const {logger, paystack_secret_key} = config
let secret = paystack_secret_key
// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{

        var hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            var data = req.body;
            // Do something with event 
            if ( data.event == 'charge.success') {

                const {reference} = data.data
                
                // get payment data
                const {amount, userUid, isUsed} = await Payments.findOne({attributes: ['amount', 'userUid', 'isUsed'], where: {transId: reference}})
                //update payment
                await Payments.update({expired: true, isUsed: true}, {
                    where: {transId: reference}
                })
                const check = await DoubleSpent.create({
                    transId: reference,
                    amount,
                    username: userUid
                })

                if ( !check ) {
                    logger.info('Already used')
                    return res.status(200)
                } else {

                    if ( isUsed ) {

                        res.sendStatus(200);
                        logger.info(`previously credited ${reference}`)
                        return  res.sendStatus(200);
                        
                    } else {
    
                        //get user wallet balance
                        await services.creditService({userUid, reference, amount})
                        return res.sendStatus(200);
                    }
                }
                


            }else if (data.event == 'transfer.success') {
                //update withdrawal status
                const {status, reference, transfer_code} = data.data
                Withdrawal.update({status}, {
                    where: {reference, transfer_code}
                })
                return res.sendStatus(200);
                
            }else if (data.event = 'transfer.failed') {
                //update withdrawal status
                const {status, reference, transfer_code, amount} = data.data

                Withdrawal.update({status}, {
                    where: {reference, transfer_code}
                })

                const { user_uid } = await Withdrawal.findOne({
                    attributes:['user_uid'],
                    where: {
                        reference,
                        transfer_code,
                        status: ['processing', 'pending']
                    }
                })
                const charges = amount <= 5000 ? 10 : amount <= 50000 ? 25 : 50;

                await creditService({userUid: user_uid, reference: 'R' + reference, amount: amount + charges, description: `#${amount + charges } withdrawal reversal`, title: 'reversal'})

                return res.sendStatus(200);

            } else {
                logger.info("webhook not used");
                return res.sendStatus(200);
            }
        }
        logger.info("webhook not useful");
        return res.sendStatus(200);
    } catch(error) {
        logger.info(error)
        return res.sendStatus(200)
    }
    
});