const { config } = require("../../config");
const { Users, Payments } = require("../../models");
const logger = config.logger
const services = require("../../services").services

exports.makePayment = ( async (req, res) => {
    let {amount} = req.body
    const { userId, email } = req.user
    amount *= 100 //convert to kobo


    try
    {
        const reference = services.idGenService(14)
        
        const payload = {email, reference, amount}
        let data = await services.initializeTransaction(payload)
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


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});