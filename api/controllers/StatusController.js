const { config } = require("../../config");
const { Status, Users, Request } = require("../../models");
const {logger, merchant_url} = config
const services = require("../../services").services
const { validationResult } = require('express-validator')
const fetchApi = require('node-fetch');
const sequelize = require('sequelize')
const {createRequest} = services

exports.createStatus = ( async (req, res) => {
    
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


            if (locationText == undefined ) {
                return res.status(400).json({
                    status: false,
                    data : {},
                    message: "Invalid location"
                })
            } else {
                // check if there is an active previous status
                const check = await Status.findOne({where: {username, status: 'ACTIVE'}})

                if (check != null && check.length > 0 ){
                    return res.status(400).json({
                        status: false,
                        data : {},
                        message: "You cannot have more than one active status. Kindly update the current active status"
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
                        balance: amount
        
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
                
            
        }
        
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});

exports.UpdateStatus = ( (req, res) => {
    
    const { fullName, username } = req.user
    const { amount, longitude, latitude, locationText, reference } = req.body
    const errors = validationResult(req);

    // logger.info(req.body)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || longitude || latitude || locationText || reference)) {
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

                Status.update({

                    username,
                    amount,
                    fullName,
                    longitude,
                    latitude,
                    locationText,
                    balance: amount
    
                }, {where: {reference, username}}).then (() => {
    
                    return res.status(202).json({
                        status: true,
                        data: {
                            amount,
                            "message": "Status updated successfully"
                        },
                        message: "success"
                    }) 
                        
                }).catch((error) => {
                    logger.info(error)
                    return res.status(404).json({
                        status: false,
                        data : error,
                        message: "Cannot update data"
                    })
                })
            
            }  
                
            
        }
        
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});

exports.UpdateStatusLocation = ( (req, res) => {
    
    const { username } = req.user
    const { longitude, latitude, locationText, reference } = req.body
    const errors = validationResult(req);

    // logger.info(req.body)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!( longitude || latitude || locationText || reference)) {
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

                Status.update({

                    longitude,
                    latitude,
                    locationText,
    
                }, {where: {reference, username, status: "ACTIVE"}}).then ((update) => {
                    if (update[0] > 0){
                        return res.status(202).json({
                            status: true,
                            data: {
                                locationText,
                                "message": "Status location updated successfully"
                            },
                            message: "success"
                        })
                    }else{
                        return res.status(400).json({
                            status: false,
                            data : {},
                            message: "Cannot update data"
                        })
                    }
 
                        
                }).catch((error) => {
                    logger.info(error)
                    return res.status(404).json({
                        status: false,
                        data : error,
                        message: "Cannot update data"
                    })
                })
            
            }  
                
            
        }
        
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});


exports.findStatus = async (req, res) => {
    const {amount, location} = req.body
    const { userId, username, email } = req.user
    const errors = validationResult(req);
    try
    {
        const charges = 0; //Math.ceil(amount / 5000) * 50 //50 per 5000
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

            const {walletBal, phoneNumber, fullName} = await Users.findOne({where: {userUid: userId}});
            const amountToUse = parseFloat(amount) + parseFloat(charges)
            if (amountToUse <= walletBal) {
                //call merchant
                data = await fetchApi(`${merchant_url}/status/find`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                          },
                        body: JSON.stringify({
                            amount,
                            location,
                            username,
                            peerNumber: phoneNumber,
                            peerFullName: fullName,
                        })
                    }
                )
                data = await data.json()
                console.log('data: => ', data)
                if (data.status === false ) {

                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: "No qualified status found"
                    })

                } else {

                    // create request here.
                    data = data.data
                    const charges = data.charges ?? 0;
                    const dataToSend = { userUid: userId, username, email, amount, charges, agent: data.agent, agentUsername: data.agentUsername, statusId: data.agentUsername, meetupPoint: data.meetupPoint, negotiatedFee: 0, transId: data.transId, agentImage: data.agentImage }
                    const cashRequest = await createRequest(dataToSend);
                    console.log('cashRequest', cashRequest)
                    // return cashRequest
                    return res.status(cashRequest.code).json({
                        status: cashRequest.status,
                        data: cashRequest.data,
                        charges,
                        message: cashRequest.message
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
            message: "error occured"
        })
    }
}

exports.allStatus = ( async (req, res) => {

    const { username } = req.user
    try
    {
        const transactions = await Status.findAll({
            attributes: ['username', 'fullName', 'longitude', 'latitude', 'locationText', 'amount', 'status', 'reference', 'balance', 'createdAt', 'updatedAt'],
            where: {username, status: "ACTIVE"},
            order: [['createdAt', 'DESC']],
        })
        const feather_commission = 0.01
        if ( transactions != null && transactions.length > 0 ) {
            let acceptedRequests = await Request.findAll({
                attributes: ['userUid','reference', 'amount', 'charges', 'total', 'status', 'meetupPoint', 'negotiatedFee', 'createdAt' ],
                where: {agentUsername: username, status: 'ACCEPTED', statusId: transactions[0].reference},
                include: {
                    model: Users,
                    attributes: ['fullName', 'username', 'phoneNumber'],
                }
            })
            let pendingRequests = await Request.findAll({
                attributes: ['userUid','reference', 'amount', 'charges', 'total', 'status', 'meetupPoint', 'negotiatedFee', 'createdAt' ],
                where: {agentUsername: username, status: 'PENDING', statusId: transactions[0].reference},
                include: {
                    model: Users,
                    attributes: ['fullName', 'username', 'phoneNumber'],
                }
            })
    
        
            const result = await Request.findAll({
                where: {agentUsername: username, status: 'SUCCESS', statusId: transactions[0].reference},
                attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalEarnings'], [sequelize.fn('SUM', sequelize.col('charges')), 'totalCharges'], [sequelize.fn('SUM', sequelize.col('negotiatedFee')), 'totalFees']]
            })
    
            let totalEarnings = result[0].dataValues.totalEarnings == null ? 0 : parseFloat(result[0].dataValues.totalEarnings - (result[0].dataValues.totalEarnings * feather_commission)) + parseFloat(result[0].dataValues.totalCharges) + parseFloat(result[0].dataValues.totalFees)
            
            return res.status(200).json({
                status: true,
                data : {
    
                    status: transactions,
                    pendingRequests,
                    acceptedRequests,
                    totalEarnings
    
                },
                message: "success"
            })
        } else {

            return res.status(200).json({
                status: true,
                data : {
    
                    status: transactions,
                    pendingRequests: [],
                    acceptedRequests: [],
                    totalEarnings: 0
    
                },
                message: "success"
            })
        }
        
        


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});