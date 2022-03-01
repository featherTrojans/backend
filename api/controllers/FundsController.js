const { config } = require("../../config");
const {Payments } = require("../../models");
const logger = config.logger
const services = require("../../services").services

exports.makePayment = ( async (req, res) => {
    let {amount} = req.body
    const { userId, email } = req.user

    amount *= 100  //convert to kobo
    const charges = (amount * 0.015)
    const amountToCharge = amount + charges

    try
    {
        const reference = services.idGenService(14)
        
        const payload = {email, reference, amountToCharge}
        let data = await services.initializeTransaction(payload)
        if (data != false ) {
            await Payments.create({
                userUid: userId,
                transId: reference,
                authorizationUrl: data.authorization_url,
                amount: amount/100,
                accessCode: data.access_code
    
            })
            return res.status(201).json({
                status: true,
                data,
                message: "success"
            })
        } else {
            return res.status(400).json({
                status: false,
                data: {},
                message: "error occur"
            })
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


exports.verifyTransaction = ( async (req, res) => {
    try{

        const {reference} =  req.body
        const payload = {reference}
        const {isUsed, expired } = await Payments.findOne({
            attributes: ['isUsed', 'expired'],
            where: {
                transId: reference
            }
        })

        if ( isUsed || expired ) {
            return res.status(419).json({
                status : false,
                data: {},
                message: `Payment ${reference} expired`
            })
        } else {

            let data = await services.verifyTransaction(payload)

            if (data == false ) {
                return res.status(404).json({
                    status : false,
                    data: {},
                    message: `Payment ${reference} not found`
                })
            } else {
                if ( data.status == 'abandoned') {
                    await Payments.update({expired: true}, {
                        where: {transId: reference}
                    })
                }
                // update database
                return res.status(200).json({
                    status : true,
                    data: data,
                    message: "success"
                })
            }
        }
        
         
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }

})