const { config } = require("../../config");
const { Request, Users } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')
const {idGenService, debitService, creditService} = services


exports.getPendingRequests = (  async (req, res) => {

    const { userId } = req.user

    try
    {
        let results = []
        const data = await Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'meetupPoint', 'negotiatedFee', 'createdAt' ],
            where: {userUid: userId, status: 'PENDING'}
        })

        for (const [key, value] of Object.entries(data)){

                //get agentDetails
                let agent = await Users.findOne({
                    where: {username: value.dataValues.agentUsername},
                    attributes: ['phoneNumber']
                })
                results.push({
                    reference: value.dataValues.reference,
                    amount: value.dataValues.amount,
                    charges: value.dataValues.charges,
                    total: value.dataValues.total,
                    negotiatedFee: value.dataValues.negotiatedFee,
                    agent: value.dataValues.agent,
                    agentUsername: value.dataValues.agentUsername,
                    phoneNumber: agent.phoneNumber,
                    status: value.dataValues.status,
                    meetupPoint: value.dataValues.meetupPoint,
                    createdAt: value.dataValues.createdAt

                })


            }
            
            return res.status(200).json({
                status: true,
                data: results,
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

exports.getAcceptedRequests = (  async (req, res) => {

    const { userId } = req.user

    try
    {
        let results = []
        const data = await Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'meetupPoint', 'negotiatedFee', 'createdAt' ],
            where: {userUid: userId, status: 'ACCEPTED'}
        })

        for (const [key, value] of Object.entries(data)){

                //get agentDetails
                let agent = await Users.findOne({
                    where: {username: value.dataValues.agentUsername},
                    attributes: ['phoneNumber']
                })
                results.push({
                    reference: value.dataValues.reference,
                    amount: value.dataValues.amount,
                    charges: value.dataValues.charges,
                    total: value.dataValues.total,
                    negotiatedFee: value.dataValues.negotiatedFee,
                    agent: value.dataValues.agent,
                    agentUsername: value.dataValues.agentUsername,
                    phoneNumber: agent.phoneNumber,
                    status: value.dataValues.status,
                    meetupPoint: value.dataValues.meetupPoint,
                    createdAt: value.dataValues.createdAt

                })


            }

            return res.status(200).json({
                status: true,
                data: results,
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

exports.cancelRequests = ( async (req, res) => {
    
    const {reference, reasonForCancel} = req.body
    const errors = validationResult(req);

    try
    {
        const {username} = req.user
        const transId = 'FTHRVRSL' + idGenService(5)
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference || reasonForCancel)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else {

            const {total, userUid, agentUsername} = await Request.findOne({attributes: ['total','userUid', 'agentUsername'],
            where: {reference}})
            const {escrowBal} = await Users.findOne({attributes: ['escrowBal'],
                    where: {
                        userUid
                    }
            })
            const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
            
            if (username.toUpperCase() === agentUsername.toUpperCase()) {

                const updated = await Request.update({status: 'CANCELLED', reasonForCancel},{
                    where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                })

                if ( updated[0] > 0 ) {

                    Users.update({escrowBal: newEscrowBal }, {where: {userUid}});
                    //return and debit escrow
                    creditService({userUid, reference: transId, amount: total, description: `NGN${total} cash withdrawal reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "cancelled successfully"
                        },
                        message: "success"
                    })
                } else {
                    console.log(updated)
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `Cannot cancel request ${reference} or it does not exist`
                    }) 
                }
                        
                
            } else{

                let data = await Request.update({status: 'CANCELLED', reasonForCancel},{
                    where: {userUid, reference, status: "PENDING"}
                })
                
                if (data[0] > 0 ) {

                    Users.update({escrowBal: newEscrowBal }, {where: {userUid}});
                    //return and debit escrow
                    creditService({userUid, reference: transId, amount: total, description: `NGN${total} cash withdrawal reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "cancelled successfully"
                        },
                        message: "success"
                    })
                } else {
                    console.log(data)
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `request ${reference} does not exist`
                    }) 
                }
                        
                
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


exports.createRequest = ( async (req, res) => {
    
    const { userId, username } = req.user
    const { amount, charges, agent, agentUsername, statusId, meetupPoint, negotiatedFee } = req.body
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
                // const ref = userId + config.time + walletBal;
                // await new Promise(function(resolve, reject) {

                //     const debitUser = debitService({userUid: userId, reference: transId, amount: total, description: `#${total} cash withdrawal`, from: username, to: agentUsername, id: ref, title: "Wallet Debit"});

                //     debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                //     // set timer to 7 secs to give room for db updates

                // })
                // credit user escrow balance
                Users.update({escrowBal: newEscrowBal, walletBal: parseFloat(walletBal - total)}, {where: {userUid: userId}});
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
                    meetupPoint,
                    negotiatedFee: negotiatedFee ? negotiatedFee : 0
    
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
    
    const { username } = req.user
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
                where: {agentUsername: username, reference, status: ["PENDING"]}
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

