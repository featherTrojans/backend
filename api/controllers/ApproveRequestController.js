const { config } = require("../../config");
const { Request, Users, Status, Transactions } = require("../../models");
const {logger, eventEmitter} = config
const services = require("../../services").services
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const {idGenService, creditService, confirmData, sendRequestWebhook} = services
const sequelize = require('sequelize')
require('../../subscribers/')

exports.approveRequest = ( async (req, res) => {
    
    let {reference, user_pin, agreedCharge} = req.body
    const errors = validationResult(req);
    const transId = idGenService(14)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference) || !(user_pin) || !(agreedCharge)) {
            
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })

        } else {

            //get userId 
            const { agent, userUid, agentUsername, statusId, charges, negotiatedFee, amount} = await Request.findOne({
                where: {reference},
                attributes: ['userUid', 'agentUsername', 'statusId', 'charges', 'negotiatedFee', 'amount', 'agent']
            });

            const total = (parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee))

            let {pin, pin_attempts, escrowBal, username, walletBal } = await Users.findOne({
                where: {userUid},
                attributes: ['pin', 'pin_attempts', 'escrowBal', 'username', 'walletBal']
            });

            //check if users has the agreed charge

            const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
            const newWalletBal = parseFloat(walletBal) + parseFloat(total)
            if (agreedCharge > walletBal){

                return res.status(400).json({
                    status: false,
                    data: {
                    },
                    message: "Hey padi you don't have up to the agreed amount in your wallet..."
                })

            } else if (pin_attempts > 3 ){

                Request.update({status: 'CANCELLED', reasonForCancel: "Incorrect Pin"},{
                    where: {reference, status: ["PENDING", "ACCEPTED"]}
                }).then ((data) => {
                    if (data[0] > 0 ) {

                        Users.update({pin_attempts: 0, escrowBal: newEscrowBal,  walletBal: newWalletBal }, {where: {userUid}});
                        //notify withdrawal
                        eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been cancelled and your funds reversed`})

                        //refund & debit escrow

                        // creditService({userUid, reference: transId, amount: total, description: `NGN${total} cash withdrawal from reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
                        sendRequestWebhook({
                            reference,
                            status: 'CANCELLED'
                        })
                        return res.status(400).json({
                            status: false,
                            data: {
                                reference,
                                message: "Cancelled"
                            },
                            message: "Request Cancelled"
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

                pin_attempts = parseFloat(pin_attempts) + 1;
                pin_verified = await bcrypt.compare(user_pin, pin);
                //check pin 
                await Users.update({pin_attempts}, {where: {userUid}});
                let bonusTransId = 'FTHBS' + idGenService(8)
                let bonusId = 'FTHBS' + idGenService(8)
                if ( pin_verified ) {

                    if (reference != null ) {

                        //get status data
                        // let statusData = await Status.findOne({where: {reference: statusId}, attributes: ['amount']});
                        // const newStatusAmount = parseFloat(statusData.amount) - parseFloat(amount)

                        // const result = await Request.findAll({
                        //     where: {agentUsername, status: 'SUCCESS'},
                        //     attributes: [[sequelize.fn('COUNT', sequelize.col('amount')), 'totalCounts']]
                        // })

                        Request.update({status: 'SUCCESS'},{
                            where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                        }).then ((data) => {

                            if (data[0] > 0 ) {
                                
                                chargedBal = parseFloat(walletBal) - parseFloat(agreedCharge)

                                Users.update({pin_attempts: 0, escrowBal: newEscrowBal, walletBal: chargedBal }, {where: {userUid}});

                                //log debit data
                                Transactions.create({
                                    userUid,
                                    transId: reference,
                                    initialBal: parseFloat(walletBal) + parseFloat(escrowBal),
                                    amount: parseFloat(total) +  parseFloat(agreedCharge),
                                    finalBal: chargedBal,
                                    description: `NGN${total} cash withdrawn`,
                                    charges: agreedCharge,
                                    from: 'primary wallet',
                                    to: `${agent}-${agentUsername}`,
                                    reference,
                                    direction: "out",
                                    title: "Cash Withdrawal"
                                })

                                eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been successfully completed`})

                                
                                sendRequestWebhook({
                                    reference,
                                    status: 'SUCCESS',
                                    agreedCharge
                                })

                                return res.status(202).json({
                                    status: true,
                                    data: {
                                        reference,
                                        "message": "Approved successfully"
                                    },
                                    message: "success"
                                })
                                
                            } else {

                                return res.status(404).json({
                                    status: false,
                                    data: {},
                                    message: `Cannot approve request ${reference} or request does not exist`
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
                        return res.status(404).json({
                            status: false,
                            data : {},
                            message: "Agent is not valid"
                        })
                    }
                    
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