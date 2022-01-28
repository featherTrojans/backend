const { config } = require("../../config");
const logger = config.logger;
const services = require("../../services").services;
const { validationResult } = require('express-validator');
const {Users, Transactions, DoubleSpent } = require("../../models");
require('../../subscribers')
const eventEmitter = config.eventEmitter


exports.transferFunds = ( async (req, res) => {
    const {transferTo, amount } = req.body
    const { userId, username } = req.user
    const errors = validationResult(req);
    try{
        if (!errors.isEmpty()) {

            return res.status(403).json({ 
                status: false,
                data: errors.array(),
                message: "Error occur"
            });
    
          } else {
            //check if the user getting payment is registered
            const {walletBal} = await Users.findOne({
                attributes: ['walletBal'],
                where: {'username': transferTo}
            })
            
            const userData = await Users.findOne({
                attributes: ['walletBal'],
                where: { userUid: userId }
            })

            if ( amount > userData.walletBal ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Insufficient fund"
        
                })
            } else {
                //check double spent
                const transId = 
                DoubleSpent.create({
                    transId,
                    username
                }).then((data) => {
                    await services.debitService({userUid, reference, amount, description: `${amount} transferred to ${transferTo}`})
                    await services.creditService({userUid: userId, reference, amount})

                }).catch((error) => {

                    return res.status(400).json({
                        status: false,
                        data : error,
                        message: "Cannot create transaction"
            
                    })
                })

            }


          }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({

            status: false,
            data : error,
            message: "Something went wrong could not transfer fund"

        })
    }

})

