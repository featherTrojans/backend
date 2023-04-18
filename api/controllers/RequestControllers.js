const { config } = require("../../config");
const { Request, Users } = require("../../models");
const {logger, eventEmitter, dollarUSLocale } = config
const {services} = require("../../services")
const { validationResult } = require('express-validator')
const {idGenService, debitService, creditService, timeService, sendRequestWebhook} = services
require('../../subscribers')


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
                    attributes: ['phoneNumber', 'imageUrl', 'userUid']
                })
                console.log(agent)
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
                    createdAt: value.dataValues.createdAt,
                    image: agent.imageUrl,
                    agentId: agent.userUid

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
                // let agent = await Users.findOne({
                //     where: {username: value.dataValues.agentUsername},
                //     attributes: ['phoneNumber', 'imageUrl', 'userUid']
                // })
                results.push({
                    reference: value.dataValues.reference,
                    amount: value.dataValues.amount,
                    charges: value.dataValues.charges,
                    total: value.dataValues.total,
                    negotiatedFee: value.dataValues.negotiatedFee,
                    agent: value.dataValues.agent,
                    agentUsername: value.dataValues.agentUsername,
                    phoneNumber: '0' + value.dataValues.agentUsername,
                    status: value.dataValues.status,
                    meetupPoint: value.dataValues.meetupPoint,
                    createdAt: value.dataValues.createdAt,
                    image: null,
                    agentId: value.dataValues.statusId

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

            const {amount, charges, negotiatedFee, userUid, agentUsername} = await Request.findOne({attributes: ['total','userUid', 'agentUsername', 'amount', 'charges', 'negotiatedFee'],
            where: {reference}})

            const {escrowBal, walletBal} = await Users.findOne({attributes: ['escrowBal', 'walletBal'],
                    where: {
                        userUid
                    }
            })

            const total = parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee)

            const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
            const newWalletBal = parseFloat(walletBal) + parseFloat(total);

            if (username.toUpperCase() === agentUsername.toUpperCase()) {

                const updated = await Request.update({status: 'CANCELLED', reasonForCancel},{
                    where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                })

                if ( updated[0] > 0 ) {

                    Users.update({escrowBal: newEscrowBal, walletBal: newWalletBal }, {where: {userUid}});
                    sendRequestWebhook({
                        reference,
                        status: 'CANCELLED'
                    })
                    //notify depositor
                    eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal has been cancelled`, redirectTo: 'Notifications'})
                    //return and debit escrow

                    // creditService({userUid, reference: transId, amount: total, description: `NGN${dollarUSLocale.format(total)} cash withdrawal reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
                    return res.status(202).json({
                        status: true,
                        data: {
                            reference,
                            "message": "cancelled successfully"
                        },
                        message: "success"
                    })
                } else {
                    logger.info(updated)
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `Cannot cancel request ${reference} or it does not exist`
                    }) 
                }
                        
                
            } else{

                let data = await Request.update({status: 'CANCELLED', reasonForCancel},{
                    where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                })
                
                if (data[0] > 0 ) {

                    Users.update({escrowBal: newEscrowBal }, {where: {userUid}});
                    sendRequestWebhook({
                        reference,
                        status: 'CANCELLED'
                    })
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
                    logger.info(data)
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
    
    const { userId, username, email } = req.user
    const { amount, charges, agent, agentUsername, statusId, meetupPoint, negotiatedFee } = req.body
    const transId = idGenService(10);
    const errors = validationResult(req);

    logger.info(req.body)

    try
    {
        if (timeService.serverTime().now >= "00:00" && timeService.serverTime().now < "05:01") {
            return res.status(400).json({
                status : false,
                data: {},
                message: "Aw Padi!! Cash requests are not available during this period, try again later!!!"
            })
        } else if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || charges || agent || agentUsername || statusId || meetupPoint)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })
        } else if (amount < 200 ) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "Invalid request amount. Make a request of NGN200 and above"
            })
        } else {

            //find requests that are not completed or cancelled
            const activeRequests = await Request.findAll({
                where: {
                    userUid: userId,
                    status: ['PENDING', 'ACCEPTED']
                }
            })

            if (activeRequests.length >= 3 ) {
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "Sorry Padi, you cannot have more than 3 active requests at a time!!!!"
                })
            } else {
                //check user balance before creating request

                const {walletBal, escrowBal} = await Users.findOne({where: {userUid: userId}});
                const total = parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee)

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
                    Users.update({escrowBal: newEscrowBal, walletBal: parseFloat(walletBal) - parseFloat(total)}, {where: {userUid: userId}});
                    const agentData = await Users.findOne({
                        where: {username: agentUsername},
                        attributes: ['email', 'fullName', 'username', 'phoneNumber', 'userUid']
                    })
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

                        const message = `Dear @${username}, you have a new cash withdrawal`;
                        eventEmitter.emit('createRequest', {email, message})
                        eventEmitter.emit('notification', {userUid: userId, title: 'Cash Withdrawal', description: 'Hey padi, your cash request has been successfully created', redirectTo: 'Withdraw'})
                        //send to agent 
                        const agentMessage = `Dear @${agentUsername}, you have a new cash withdrawal from @${username}, login to complete transaction`;
                        eventEmitter.emit('notification', {userUid: agentData.userUid, title: 'Cash Withdrawal', description: `Hey padi, you have a new cash withdrawal request from  @${username}.`, redirectTo: 'Depositupdate'})

                        eventEmitter.emit('createRequest', {email: agentData.email, message: agentMessage})

        
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
                        logger.info(error)
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

exports.markRequests = ( async (req, res) => {
    
    const { username, email, userId } = req.user
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
            const {userUid} = await Request.findOne({where: {reference}})
            const user = await Users.findOne({
                where: {userUid},
                attributes: ['email', 'fullName', 'username', 'phoneNumber']
            })

            Request.update({status: 'ACCEPTED'},{
                where: {agentUsername: username, reference, status: ["PENDING"]}
            }).then ((data) => {
                if (data[0] > 0 ) {

                    const message = `Dear @${user.username}, your cash withdrawal has been accepted by ${username}. Login to view transaction and head to the meeting point to complete transaction`;
                    eventEmitter.emit('acceptRequest', {email: user.email, message})
                    eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey, your cash withdrawal  has been accepted by @${username}. Head to the meeting point to complete transaction`, redirectTo: 'Withdraw'})

                    //send to agent 
                    const agentMessage = `Dear @${username}, your cash withdrawal  has been accepted successfully. Head to the meeting point to complete transaction`;

                    eventEmitter.emit('createRequest', {email, message: agentMessage})
                    eventEmitter.emit('notification', {userUid: userId, title: 'Cash Withdrawal', description: agentMessage, redirectTo: 'Depositupdate'})
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

