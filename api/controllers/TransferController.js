const { config } = require("../../config");
const logger = config.logger;
const services = require("../../services").services;
const { validationResult } = require('express-validator');
const {Users, Transactions } = require("../../models");
require('../../subscribers')
const eventEmitter = config.eventEmitter


exports.transferFunds = ( async (req, res) => {
    const {transferTo, amount } = req.body
    const { userId, username, email } = req.user
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

