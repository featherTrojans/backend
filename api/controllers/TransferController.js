const { config } = require("../../config");
const {logger, Op, merchant_url} = config;
const services = require("../../services").services;
const { validationResult } = require('express-validator');
const {Users, DoubleSpent } = require("../../models");
const bcrypt = require('bcryptjs');
const {timeService} = services
let fetchApi = require('node-fetch')


exports.transferFunds = ( async (req, res) => {
    const {transferTo, amount, userPin, narration } = req.body
    const { userId, username } = req.user
    const errors = validationResult(req);

    try{
        if (!errors.isEmpty()) {

            return res.status(403).json({ 
                status: false,
                data: errors.array(),
                message: "Error occured"
            });
    
          } else {
            //check if the user getting payment is registered
            const {userUid} = await Users.findOne({
                attributes: ['userUid'],
                where: {
                    [Op.or]: {
                        username: transferTo,
                        phoneNumber: transferTo
                    },
                }
            })
            
            const {walletBal, pin} = await Users.findOne({
                attributes: ['walletBal', 'pin'],
                where: { userUid: userId }
            })
            const verifyPin = await bcrypt.compare(userPin, pin);

            if (verifyPin != true ) {
                return res.status(403).json({

                    status: false,
                    data : {},
                    message: "Pin is Incorrect"
        
                })
            }else if (username.toUpperCase() == transferTo.toUpperCase() ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Cannot transfer to self"
        
                })
            } else if ( amount > walletBal ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Insufficient fund"
        
                })
            } else if (amount <= 0 ){
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Invalid amount"
        
                })
            } else {
                //check double spent
                const transId =  timeService.serverTime().timeToUse + userId + walletBal;
                const reference = services.idGenService(10);
                const creditReference = services.idGenService(10);
                DoubleSpent.create({
                    transId,
                    username,
                    amount
                }).then(() => {

                    //use promise so that the process will be asynchronous

                    new Promise(function(resolve, reject) {

                        const debitService = services.debitService({userUid: userId, reference, amount, description: `NGN${amount} transferred to ${transferTo}`, from: username, to: transferTo, id: transId, title: 'Wallet Debit', type: "Feather2Feather"});

                        debitService ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                        // set timer to 7 secs to give room for db updates

                    }).then(() => {

                        // credit after successful debit
                        services.creditService({userUid, reference: creditReference, amount, from: username, to: transferTo, description: `NGN${amount} transferred from ${username}  ${narration}`, id: transId, title: 'Wallet Credit', type: "Feather2Feather"})

                    }).catch(error => {
                        logger.debug(error)
                        return res.status(400).json({
                            status: false,
                            data : error,
                            message: "Cannot create transaction"
            
                        })
                    });

                    return res.status(200).json({
                        status: true,
                        data : {
                            "from": username,
                            "to": transferTo,
                            amount
                        },
                        message: `#${amount} transferred to ${transferTo} successfully`
            
                    })

                }).catch((error) => {
                    logger.debug(error)
                    return res.status(400).json({
                        status: false,
                        data : error,
                        message: "Cannot create transaction"
            
                    })
                })

            }


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


exports.transferFundsToAgent = ( async (req, res) => {
    const {transferTo, amount, userPin, narration } = req.body
    const { userId, username } = req.user
    const errors = validationResult(req);

    try{
        if (!errors.isEmpty()) {

            return res.status(403).json({ 
                status: false,
                data: errors.array(),
                message: "Error occured"
            });
    
          } else {
            //check if the user getting payment is registered
            merchant = await fetchApi(`${merchant_url}/agent/get/${transferTo}`)
            merchant = await merchant.json()
            console.log('merchant', merchant)
            let { agentId , business_name} = merchant.data

            const {walletBal, pin, fullName} = await Users.findOne({
                attributes: ['walletBal', 'pin', 'fullName'],
                where: { userUid: userId }
            })
            const verifyPin = await bcrypt.compare(userPin, pin);
            if (merchant.status != true ){
                return res.status(404).json({

                    status: false,
                    data : {},
                    message: "Merchant does not exist"
        
                })
            } else if (verifyPin != true ) {
                return res.status(403).json({

                    status: false,
                    data : {},
                    message: "Pin is Incorrect"
        
                })
            }else if (username.toUpperCase() == transferTo.toUpperCase() ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Cannot transfer to self"
        
                })
            } else if ( amount > walletBal ) {
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Insufficient fund"
        
                })
            } else if (amount <= 0 ){
                return res.status(400).json({

                    status: false,
                    data : {},
                    message: "Invalid amount"
        
                })
            } else {
                //check double spent
                const transId =  timeService.serverTime().timeToUse + userId + walletBal;
                const reference = services.idGenService(10);
                const creditReference = services.idGenService(10);
                DoubleSpent.create({
                    transId,
                    username,
                    amount
                }).then(() => {

                    //use promise so that the process will be asynchronous

                    new Promise(function(resolve, reject) {

                        const debitService = services.debitService({userUid: userId, reference, amount, description: `NGN${amount} transferred to ${business_name}`, from: username, to: business_name, id: transId, title: 'Wallet Debit', type: "Feather2Agent"});

                        debitService ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                        // set timer to 7 secs to give room for db updates

                    }).then(() => {

                        // credit after successful debit
                        // services.creditService({userUid, reference: creditReference, amount, from: username, to: transferTo, description: `NGN${amount} transferred from ${username}`, id: transId, title: 'Wallet Credit', type: "Feather2Feather"})
                        let data = {peerFullName: fullName, reference, creditReference, amount, peerUsername: username, agentId, transId }
                        //send to agent 
                        fetchApi(`${merchant_url}/peer/transfer`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                                },
                            body: JSON.stringify(
                                data
                            )
                        }
                        ).then( resp => resp.json())
                        .then(result => {
                            console.log("Transfer result: ", result)
                            if (result.status) {
                                return res.status(200).json({
                                    status: true,
                                    data : {
                                        "from": username,
                                        "to": business_name,
                                        amount
                                    },
                                    message: `#${amount} transferred to ${business_name} successfully`
                        
                                })
                            } else {
                                return res.status(400).json({
                                    status: false,
                                    data : {},
                                    message: "Oops padi, something happened! Cannot make this transfer at the moment, please try again later"
                    
                                })
                            }
                        }).catch(error => {
                            logger.info(error)
                            return res.status(400).json({
                                status: false,
                                data : error,
                                message: "Oops padi! Cannot make this transfer at the moment, please try again later"
                
                            })
                        })

                    }).catch(error => {
                        logger.debug(error)
                        return res.status(400).json({
                            status: false,
                            data : error,
                            message: "Cannot create transaction"
            
                        })
                    });

                    

                }).catch((error) => {
                    logger.debug(error)
                    return res.status(400).json({
                        status: false,
                        data : error,
                        message: "Cannot create transaction"
            
                    })
                })

            }


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

