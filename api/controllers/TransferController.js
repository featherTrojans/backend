const { config } = require("../../config");
const logger = config.logger;
const services = require("../../services").services;
const { validationResult } = require('express-validator');
const {Users, DoubleSpent } = require("../../models");
const bcrypt = require('bcryptjs');
const d = new Date();
let time = d.getTime();


exports.transferFunds = ( async (req, res) => {
    const {transferTo, amount, userPin } = req.body
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
            const {userUid} = await Users.findOne({
                attributes: ['userUid'],
                where: {'username': transferTo}
            })
            
            const {walletBal, pin} = await Users.findOne({
                attributes: ['walletBal', 'pin'],
                where: { userUid: userId }
            })
            const verifyPin = await bcrypt.compare(userPin, pin);
            logger.info((userPin))
            if (verifyPin != true ) {
                return res.status(403).json({

                    status: false,
                    data : {},
                    message: "Pin is Incorrect"
        
                })
            } else if (username == transferTo) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Cannot transfer to self"
        
                })
            } else if ( amount > walletBal ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Insufficient fund"
        
                })
            } else {
                //check double spent
                const transId = userId + time + walletBal;
                const reference = services.idGenService(10);
                const creditReference = services.idGenService(10);
                DoubleSpent.create({
                    transId,
                    username,
                    amount
                }).then(() => {

                    services.debitService({userUid: userId, reference, amount, description: `#${amount} transferred to ${transferTo}`, from: username, to: transferTo, id: transId})

                    services.creditService({userUid, reference: creditReference, amount, from: username, to: transferTo, description: `#${amount} transferred from ${username}`, id: transId})

                    return res.status(200).json({
                        status: true,
                        data : {
                            "from": username,
                            "to": transferTo,
                            amount
                        },
                        message: `#${amount} transferred to ${transferTo} successfully`
            
                    })
                }).catch((error) => {
                    logger.debug(error)
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

