const {
    buyCable, 
    debitService,
    idGenService,
    timeService
} = require('../../services').services
const {Users, NewBills, DoubleSpent, UserLevels} = require('../../models')
const {logger, environment} = require('../../config/').config
const bcrypt = require('bcryptjs');

exports.buyCable = ( async (req, res) => {
    const {userId, username} = req.user
    const { service, smartcard_number, productCode, userPin, amount, customerName} = req.body


    try{


        const {walletBal, pin, userLevel, phoneNumber} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal', 'pin', 'userLevel', 'phoneNumber']})
        const verifyPin = await bcrypt.compare(userPin, pin);

        // get level details
        let {privilege} = await UserLevels.findOne({where: {level: userLevel}})

        if (verifyPin != true ) {
            return res.status(403).json({

                status: false,
                data : {},
                message: "Pin is Incorrect"
    
            })
        }else if ( amount > walletBal) {
            return res.status(400).json({
                status: false,
                data : {
                    network,
                    phone,
                    amount
                },
                message: `Cannot purchase cable (${service}) at the moment because your balance is not enough `

            })
        }else if (environment == 'live' && (parseFloat(walletBal)) > JSON.parse(privilege).wallet){
            return res.status(403).json({
                status: false,
                data: {},
                message: `Hi Padi, your account has been suspended, kindly upgrade to continue enjoying our services or contact support`
            })
        }
        else if (service === null || service === '' ) {
            return res.status(400).json({

                status: false,
                data : {},
                message: `Oops Padi!!! You can not purchase cable (${service}) at the moment please contact support!!!`
    
            })
        } else if (amount === null || amount === '' ) {
            return res.status(400).json({

                status: false,
                data : {},
                message: `Oops Padi!!! You can not make ${service} transaction at the moment!!! Amount is required`
    
            })
        } else if (userPin === null || userPin === '' ) {
            return res.status(400).json({

                status: false,
                data : {},
                message: "Oops Padi!!! You have forgot to input your pin!!!"
    
            })
        }  
        else{

            const reference = 3 + idGenService(10);
            const transId =  timeService.serverTime().timeToUse + userId + walletBal;
            const insert = await DoubleSpent.create({
                transId,
                username,
                amount
            })
            if (insert) {
                new Promise(function(resolve, reject) {

                    const debitUser = debitService({userUid: userId, reference, amount, description: `NGN${amount} ${service}  purchased on ${smartcard_number}`, from: service, to: smartcard_number.toString(), title: "PayBills Purchase"});

                    debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                    // set timer to  9 secs to give room for db updates

                }).then(() => {

                    NewBills.create({
                        userUid: userId,
                        amount,
                        beneficiary: smartcard_number,
                        reference,
                        transId: reference,
                        network: service,
                        description: `NGN${amount} ${service} purchased on ${smartcard_number}`
                    }).then(()=> {

                        buyCable({trans_id: reference, phone: phoneNumber, service, smartcard_number, productCode, amount, customerName}).then((buyCable) => {
                            console.log('buyCable', buyCable)
                            if ( buyCable == false) {
    
                                //update NewBills status 
                                NewBills.update({status: "FAILED"}, {where: {reference}})
                               console.log(json({
                                    status: false,
                                    data : {
                                        service,
                                        smartcard_number,
                                        amount
                                    },
                                    message: "Cannot perform transaction at the moment please try again later"
                    
                                }))
                            } else if (buyCable.message == 'success' || buyCable.message == '') {
                                //update NewBills table
                                NewBills.update({
                                    status: "SUCCESS", transId: buyCable.request_id,
                                    
                                }, {where: {reference}})
                                console.log(json({
                                    status: true,
                                    data: {
                                        service,
                                        amount,
                                        smartcard_number
                                    },
                                    message: "Hi padi, Successfully purchased"
                                }))
                            }
                        }).catch(err => {
                            logger.info(err)
                            // return res.status(400).
                            console.log(json({
                                status: false,
                                data : err,
                                message: "Hi padi an error occurred"
    
                            }))
                        })
    
                    }).catch(err => {
                        logger.info(err)
                        // return res.status(400).
                        console.log(json({
                            status: false,
                            data: err,
                            message: "Hi padi, cannot create this at this time"

                        }))
                    })

                    return res.status(200).json({
                        status: true,
                        data: {},
                        message: "Hey padi, your order is processing"
                    })
                    
                    
                }).catch(error => {
                    logger.info(error)
                    return res.status(400).json({
                        status: false,
                        data : error,
                        message: "Cannot create transaction"

                    })
                });

            }  else {
                return res.status(400).json({
                    status: false,
                    data : {},
                    message: "Cannot make transaction"
        
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
})
