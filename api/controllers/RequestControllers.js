const { config } = require("../../config");
const { Request } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')


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
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'createdAt' ],
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


exports.createRequest = ( (req, res) => {
    
    const { userId } = req.user
    const { amount, charges, agent, agentUsername } = req.body
    const transId = services.idGenService(10);
    const errors = validationResult(req);

    logger.info(req.body)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || charges || agent || agentUsername)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {

            Request.create({

                userUid: userId,
                amount,
                charges,
                agent,
                agentUsername,
                transId,
                reference: transId,
                total: parseFloat(amount) + parseFloat(charges)

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

            Request.update({status: 'SUCCESS'},{
                where: {userUid: userId, reference, status: ["ACCEPTED", "PENDING"]}
            }).then ((data) => {
                if (data[0] > 0 ) {
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "Received successfully"
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