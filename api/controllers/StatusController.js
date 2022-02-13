const { config } = require("../../config");
const { Status } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')

exports.createStatus = ( (req, res) => {
    
    const { fullName, username } = req.user
    const { amount, longitude, latitude, locationText } = req.body
    const reference = services.idGenService(10);
    const errors = validationResult(req);

    // logger.info(req.body)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || longitude || latitude || locationText)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {


            // if (total <= walletBal) {
                //debit user
                // await new Promise(function(resolve, reject) {

                //     const debitService = services.debitService({userUid: userId, reference: transId, amount: total, description: `#${amount} transferred to Escrow`, from: username, to: 'Escrow', id: ref});

                //     debitService ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                //     // set timer to 7 secs to give room for db updates

                // })
                Status.create({

                    username,
                    amount,
                    fullName,
                    longitude,
                    latitude,
                    locationText,
                    reference,
    
                }).then (() => {
    
                    return res.status(201).json({
                        status: true,
                        data: {
                            amount,
                            "message": "Status created successfully"
                        },
                        message: "success"
                    }) 
                        
                }).catch((error) => {
                    return res.status(404).json({
                        status: false,
                        data : error,
                        message: "Cannot create data"
                    })
                })
            // } else {
            //     return res.status(403).json({
            //         status: false,
            //         data: {},
            //         message: "Insufficient balance"
            //     })
            // }
            
        }
        
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});