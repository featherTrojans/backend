const { config } = require("../../config");
const { Request, Users } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')
const {idGenService, debitService} = services


exports.getPendingRequests = (  (req, res) => {

    const { userId } = req.user

    try
    {
        Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'createdAt' ],
            where: {userUid: userId, status: 'PENDING'}
        }).then ((data) => {
            return res.status(200).json({
                status: true,
                data,
                message: "success"
            })
        }).catch((error) => {
            return res.status(404).json({
                status: false,
                data : error,
                message: "Cannot get data"
            })
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

exports.getAcceptedRequests = (  (req, res) => {

    const { userId } = req.user

    try
    {
        Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'meetupPoint', 'createdAt' ],
            where: {userUid: userId, status: 'ACCEPTED'}
        }).then ((data) => {
            return res.status(200).json({
                status: true,
                data,
                message: "success"
            })
        }).catch((error) => {
            return res.status(404).json({
                status: false,
                data : error,
                message: "Cannot get data"
            })
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

exports.cancelRequests = ( (req, res) => {
    
    const { userId } = req.user
    const {reference, reasonForCancel} = req.body
    const errors = validationResult(req);

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference || reasonForCancel)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {

            Request.update({status: 'CANCELLED', reasonForCancel},{
                where: {userUid: userId, reference, status: "PENDING"}
            }).then ((data) => {
                if (data[0] > 0 ) {
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "cancelled successfully"
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `request ${reference} does not exist`
                    }) 
                }
                    
            }).catch((error) => {
                return res.status(404).json({
                    status: false,
                    data : error,
                    message: "Cannot modify data"
                })
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


exports.createRequest = ( async (req, res) => {
    
    const { userId, username } = req.user
    const { amount, charges, agent, agentUsername, statusId, meetupPoint } = req.body
    const transId = idGenService(10);
    const errors = validationResult(req);

    logger.info(req.body)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || charges || agent || agentUsername || statusId || meetupPoint)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {

            //check user balance before creating request

            const {walletBal, escrowBal} = await Users.findOne({where: {userUid: userId}});
            const total = parseFloat(amount) + parseFloat(charges)
            if (total <= walletBal) {
                //debit user
                const newEscrowBal = parseFloat(escrowBal) + parseFloat(total);
                const ref = userId + config.time + walletBal;
                await new Promise(function(resolve, reject) {

                    const debitUser = debitService({userUid: userId, reference: transId, amount: total, description: `#${total} transferred to Escrow`, from: username, to: 'Escrow', id: ref, title: "Wallet Debit"});

                    debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                    // set timer to 7 secs to give room for db updates

                })
                // credit user escrow balance
                Users.update({escrowBal: newEscrowBal}, {where: {userUid: userId}});
                Request.create({

                    userUid: userId,
                    amount,
                    charges,
                    agent,
                    agentUsername,
                    transId,
                    reference: transId,
                    total,
                    statusId,
                    meetupPoint
    
                }).then (() => {
    
                    return res.status(201).json({
                        status: true,
                        data: {
                            amount,
                            agent,
                            "message": "request created successfully"
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
});

exports.markRequests = ( (req, res) => {
    
    const { userId } = req.user
    const {reference} = req.params
    const errors = validationResult(req);

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference)) {
            
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })

        } else {

            Request.update({status: 'ACCEPTED'},{
                where: {userUid: userId, reference, status: ["PENDING"]}
            }).then ((data) => {
                if (data[0] > 0 ) {
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "Request accepted"
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `request ${reference} does not exist`
                    }) 
                }
                    
            }).catch((error) => {
                return res.status(404).json({
                    status: false,
                    data : error,
                    message: "Cannot modify data"
                })
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


exports.getRequestStatus = (  (req, res) => {

    const { reference } = req.params

    try
    {
        Request.findOne({
            attributes: [ 'status' ],
            where: {reference}
        }).then ((data) => {
            if (data != null ) {
                return res.status(200).json({
                    status: true,
                    data,
                    message: "success"
                })
            } else {
                return res.status(404).json({
                    status: false,
                    data : {},
                    message: `Cannot get status for ${reference}`
                })
            }
            
        }).catch((error) => {
            return res.status(404).json({
                status: false,
                data : error,
                message: "Cannot get status"
            })
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

