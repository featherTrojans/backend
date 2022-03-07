const { config } = require("../../config");
const { Request, Users } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')


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


exports.createRequest = ( async (req, res) => {
    
    const { userId, username } = req.user
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

            //check user balance before creating request

            const {walletBal, escrowBal} = await Users.findOne({where: {userUid: userId}});
            const total = parseFloat(amount) + parseFloat(charges)
            if (total <= walletBal) {
                //debit user
                const newEscrowBal = parseFloat(escrowBal) + parseFloat(total);
                const ref = userId + config.time + walletBal;
                await new Promise(function(resolve, reject) {

                    const debitService = services.debitService({userUid: userId, reference: transId, amount: total, description: `#${total} transferred to Escrow`, from: username, to: 'Escrow', id: ref});

                    debitService ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
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
                    total
    
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

exports.approveRequest = ( (req, res) => {
    
    let {reference, pin} = req.body
    const errors = validationResult(req);

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference) || !(pin)) {
            
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })

        } else {

            //get userId 
            const { userUid } = Request.findOne({
                where: {reference},
                attributes: ['userUid']
            });

            const user_pin = pin;

             let {pin, pin_attempts} = Users.findOne({
                where: {userUid},
                attributes: ['pin', 'pin_attempts']
            });

            if (pin_attempts >= 4 ){

                Request.update({status: 'CANCELLED', reasonForCancel: "Incorrect Pin"},{
                    where: {userUid, reference, status: ["PENDING", "APPROVED"]}
                }).then ((data) => {
                    if (data[0] > 0 ) {

                        Users.update({pin_attempts: 0 }, {where: {userUid}});

                        return res.status(400).json({
                            status: true,
                            data: {
                                reference,
                                message: "Cancelled"
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

            } else {

                pin_attempts += 1;
                pin_verified = await bcrypt.compare(user_pin, pin);
                //check pin 
                Users.update({pin_attempts}, {where: {userUid}});

                if ( pin_verified ) {

                    Request.update({status: 'SUCCESS'},{
                        where: {userUid, reference, status: ["PENDING"]}
                    }).then ((data) => {

                        if (data[0] > 0 ) {

                            Users.update({pin_attempts: 0 }, {where: {userUid}});
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
                } else {
                    //update number of times used
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: "Incorrect Pin"
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