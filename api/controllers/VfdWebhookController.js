var crypto = require('crypto');
const { request } = require('https');
const { config } = require('../../config');
const { Payments, Withdrawal, DoubleSpent, Webhook } = require('../../models');
const { services } = require('../../services');
const creditService = require('../../services/middlewares/creditService');
var secret = config.paystack_secret_key;
const logger = config.logger
// Using Express
exports.webhook = (async (req, res) => {
    //validate event
    try{
        
        const {body} = req
        // console.log(req.connection.remoteAddress)
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        Webhook.create({
            ip,
            data: JSON.stringify(body)
        })
        logger.info("Vfd webhook called");
        return res.sendStatus(200);
    } catch(error) {
        logger.info(error)
        return res.sendStatus(200)
    }
    
});