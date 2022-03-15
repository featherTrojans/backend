const { config } = require("../../config");
const { Status, Users } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')
const {returnLocation} = services

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


            if (locationText.includes('undefined')) {
                return res.status(400).json({
                    status: false,
                    data : {},
                    message: "Invalid location"
                })
            } else {

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
});

exports.findStatus = async (req, res) => {
    const {amount, location} = req.body
    const { userId, username } = req.user
    const errors = validationResult(req);
    try
    {
        const charges = Math.ceil(amount / 5000) * 100 //100 per 5000
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || location)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {

            //check user balance before creating request

            const {walletBal} = await Users.findOne({where: {userUid: userId}});
            const amountToUse = parseFloat(amount) + parseFloat(charges)
            if (amountToUse <= walletBal) {
                const data = await returnLocation({amount, location, username})
                if (data === false ) {

                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: "No qualified status found"
                    })
                } else {
                    return res.status(200).json({
                        status: true,
                        data,
                        charges,
                        message: 'statuses found successfully'
                    })
                }
                
            } else {
                return res.status(403).json({
                    status: false,
                    data: {},
                    message: "Insufficient balance"
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
}

exports.allStatus = ( async (req, res) => {

    const { userId } = req.user
    try
    {
        const {username} = await Users.findOne({where: {userUid: userId}})
        const transactions = await Status.findAll({
            attributes: ['username', 'fullName', 'longitude', 'latitude', 'locationText', 'amount', 'status', 'reference', 'createdAt'],
            where: {username, status: "ACTIVE"},
            order: [['createdAt', 'DESC']],
        })
        return res.status(200).json({
            status: true,
            data : {

                transactions

            },
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