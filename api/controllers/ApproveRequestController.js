const { config } = require("../../config");
const { Request, Users, Status } = require("../../models");
const logger = config.logger
const services = require("../../services").services
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const {idGenService, creditService, confirmData} = services

exports.approveRequest = ( async (req, res) => {
    
    let {reference, user_pin} = req.body
    const {userId} = req.user
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
            const { userUid, total, agentUsername, statusId, charges} = await Request.findOne({
                where: {reference},
                attributes: ['userUid', 'total', 'agentUsername', 'statusId', 'charges']
            });


            let {pin, pin_attempts, escrowBal, username } = await Users.findOne({
                where: {userUid},
                attributes: ['pin', 'pin_attempts', 'escrowBal', 'username']
            });

            const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
            if (pin_attempts > 3 ){

                Request.update({status: 'CANCELLED', reasonForCancel: "Incorrect Pin"},{
                    where: {reference, status: ["PENDING", "ACCEPTED"]}
                }).then ((data) => {
                    if (data[0] > 0 ) {

                        Users.update({pin_attempts: 0, escrowBal: newEscrowBal }, {where: {userUid}});

                        //refund & debit escrow
                        creditService({userUid, reference: transId, amount: total, description: `NGN${total} cash withdrawal from reversal`, from: agentUsername, to: 'primary wallet', title: 'Wallet Credit'});
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

                if ( pin_verified ) {
                    const agentData = await confirmData({type: 'username', data: agentUsername}) 
                    if (agentData != null ) {
                        var agentId = agentData.userUid;

                        const feather_commission = 1/100;
                        const amountToCredit = parseFloat(total) - (parseFloat(total - charges) * feather_commission);

                        //get status data
                        let {amount} = await Status.findOne({where: {reference: statusId}, attributes: ['amount']});
                        const newStatusAmount = parseFloat(amount) - (parseFloat(total) - parseFloat(charges))


                        Request.update({status: 'SUCCESS'},{
                            where: {userUid, reference, status: ["PENDING", "ACCEPTED"]}
                        }).then ((data) => {

                            if (data[0] > 0 ) {

                                //update status amount
                                Status.update({amount: newStatusAmount}, {where: {reference: statusId}});
                                
                                Users.update({pin_attempts: 0, escrowBal: newEscrowBal }, {where: {userUid}});
                                //credit reciever and debit escrow
                                creditService({userUid: agentId, reference: transId, amount: amountToCredit, description: `NGN${amountToCredit} cash withdrawal from ${username}`, from: username, to: 'primary wallet', title: 'Wallet Credit'});

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