const { config } = require("../../config");
const { Request, Users, Status, Transactions } = require("../../models");
const {logger, eventEmitter} = config
const services = require("../../services").services
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const {idGenService, creditService, confirmData} = services
const sequelize = require('sequelize')
require('../../subscribers/')

exports.approveRequest = ( async (req, res) => {
    
    let {reference, user_pin} = req.body
    const errors = validationResult(req);
    const transId = idGenService(14)

    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(reference) || !(user_pin)) {
            
            return res.status(400).json({
                status : false,
                data: {},
                message: "All fields are required"
            })

        } else {

            //get userId 
            const { userUid, agentUsername, statusId, charges, negotiatedFee, amount} = await Request.findOne({
                where: {reference},
                attributes: ['userUid', 'agentUsername', 'statusId', 'charges', 'negotiatedFee', 'amount']
            });

            const total = (parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee))

            let {pin, pin_attempts, escrowBal, username, walletBal } = await Users.findOne({
                where: {userUid},
                attributes: ['pin', 'pin_attempts', 'escrowBal', 'username', 'walletBal']
            });

            const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
            const newWalletBal = parseFloat(walletBal) + parseFloat(total)
            if (pin_attempts > 3 ){

                Request.update({status: 'CANCELLED', reasonForCancel: "Incorrect Pin"},{
                    where: {reference, status: ["PENDING", "ACCEPTED"]}
                }).then ((data) => {
                    if (data[0] > 0 ) {

                        Users.update({pin_attempts: 0, escrowBal: newEscrowBal,  walletBal: newWalletBal }, {where: {userUid}});
                        //notify withdrawal
                        eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been cancelled and your funds reversed`})

                        //notify depositor
                        eventEmitter.emit('notification', {userUid: agentId, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been cancelled`})

                        //refund & debit escrow

                        // creditService({userUid, reference: transId, amount: total, description: `NGN${total} cash withdrawal from reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
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

                pin_attempts += 1;
                pin_verified = await bcrypt.compare(user_pin, pin);
                //check pin 
                await Users.update({pin_attempts}, {where: {userUid}});
                let bonusTransId = 'FTHBS' + idGenService(8)
                let bonusId = 'FTHBS' + idGenService(8)
                if ( pin_verified ) {
                    const agentData = await confirmData({type: 'username', data: agentUsername}) 
                    if (agentData != null ) {
                        var agentId = agentData.userUid;

                        const feather_commission = 1/100;
                        const amountToCredit = parseFloat(total) - (parseFloat(amount) * feather_commission);

                        //get status data
                        let statusData = await Status.findOne({where: {reference: statusId}, attributes: ['amount']});
                        const newStatusAmount = parseFloat(statusData.amount) - parseFloat(amount)

                        const result = await Request.findAll({
                            where: {agentUsername, status: 'SUCCESS'},
                            attributes: [[sequelize.fn('COUNT', sequelize.col('amount')), 'totalCounts']]
                        })

                        const resultTwo = await Request.findAll({
                            where: {userUid, status: 'SUCCESS'},
                            attributes: [[sequelize.fn('COUNT', sequelize.col('amount')), 'totalCounts']]
                        })


                        Request.update({status: 'SUCCESS'},{
                            where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                        }).then ((data) => {

                            if (data[0] > 0 ) {

                                //update status amount
                                Status.update({balance: newStatusAmount}, {where: {reference: statusId}});
                                
                                Users.update({pin_attempts: 0, escrowBal: newEscrowBal }, {where: {userUid}});

                                //log debit data
                                Transactions.create({
                                    userUid,
                                    transId: reference,
                                    initialBal: parseFloat(walletBal) + parseFloat(escrowBal),
                                    amount: total,
                                    finalBal: walletBal,
                                    description: `NGN${total} cash withdrawal`,
                                    from: 'primary wallet',
                                    to: agentUsername,
                                    reference,
                                    direction: "out",
                                    title: "Wallet Debit"
                                })
                                //credit reciever and debit escrow
                                //first credit
                                new Promise(function(resolve, reject) { 
                                    const creditAgent = creditService({userUid: agentId, reference: transId, amount: amountToCredit, description: `NGN${amountToCredit} cash withdrawal from ${username}`, from: username, to: 'primary wallet', title: 'Wallet Credit'})

                                    creditAgent ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                                }).then(()=> {
                                    // let totalCounts = result[0].dataValues.totalCounts == null ? 0 : result[0].dataValues.totalCounts + 1

                                    // totalCounts >=1 && totalCounts <= 5 ? creditService({userUid: agentId, reference: bonusId, amount: 100, description: `NGN100 cash withdrawal bonus from ${reference}`, from: 'Bonus', to: 'primary wallet', title: 'Wallet Credit'}): '';
    
                                    // let totalCount = resultTwo[0].dataValues.totalCounts == null ? 0 : resultTwo[0].dataValues.totalCounts + 1
    
                                    // totalCount >= 1 && totalCount <= 5 ? creditService({userUid, reference: bonusTransId, amount: 100, description: `NGN100 cash withdrawal bonus from ${reference}`, from: 'Bonus', to: 'primary wallet', title: 'Wallet Credit'}): '';
    
                                    eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been successfully completed`})
    
                                    eventEmitter.emit('notification', {userUid: agentId, title: 'Cash Withdrawal', description: `Hey your cash withdrawal request has been successfully completed`})
                                    
    
    
                                    return res.status(202).json({
                                        status: true,
                                        data: {
                                            reference,
                                            "message": "Approved successfully"
                                        },
                                        message: "success"
                                    })
    
                                }).catch(error => {
                                    logger.info(error)
                                    return res.status(400).json({
                                        status: false,
                                        data : error,
                                        message: "Cannot credit user"
                        
                                    })
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