const {
    buyAirtimeData, 
    creditService,
    debitService,
    idGenService,
    timeService
} = require('../../services').services
const {Users, NewBills, DoubleSpent, UserLevels} = require('../../models')
const {logger, environment} = require('../../config/').config
const bcrypt = require('bcryptjs');

exports.buyAirtime = ( async (req, res) => {

    const {userId, username} = req.user
    const { phone, network, amount, userPin } = req.body


    try{


        const {walletBal, pin, userLevel} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal', 'pin', 'userLevel']})
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
                message: "Cannot purchase airtime at the moment because your balance is not enough "

            })
        }else if (environment == 'live' && (parseFloat(walletBal)) > JSON.parse(privilege).wallet){
            return res.status(403).json({
                status: false,
                data: {},
                message: `Hi Padi, your account has been suspended, kindly upgrade to continue enjoying our services or contact support`
            })
        }else if (amount < 100 ) {
            return res.status(400).json({

                status: false,
                data : {},
                message: "Oops Padi!!! You can not purchase airtime lower than NGN100. Kindly try with NGN100 or more"
    
            })
        }else if (network.toLowerCase() == 'airtel' ) {
            return res.status(400).json({

                status: false,
                data : {},
                message: "Oops Padi!!! You can not purchase airtime for this network at the moment please try again later"
    
            })
        } else{

            const reference = 3 + idGenService(10);
            const creditReference = 'FTH' + idGenService(10)
            const transId =  timeService.serverTime().timeToUse + userId + walletBal;
            const insert = await DoubleSpent.create({
                transId,
                username,
                amount
            })
            if (insert) {
                new Promise(function(resolve, reject) {

                    const debitUser = debitService({userUid: userId, reference, amount, description: `NGN${amount} ${network} airtime purchased on ${phone}`, from: network, to: phone.toString(), title: "Airtime Purchase"});

                    debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                    // set timer to  9 secs to give room for db updates

                }).then(() => {

                    NewBills.create({
                        userUid: userId,
                        amount,
                        beneficiary: phone,
                        reference,
                        transId: reference,
                        network,
                        description: `NGN${amount} ${network} airtime purchased on ${phone}`
                    }).then(()=> {

                        buyAirtimeData({phone,network, amount, type: 'airtime', trans_id: reference}).then((buyAirtime) => {
                            console.log('buyAirtime', buyAirtime)
                            if ( buyAirtime == false) {
    
                                //return charged amount
                                new Promise(function(resolve, reject) {
                                    let reCredit = creditService({userUid: userId, reference: creditReference, amount, from: 'pay Bills', to: 'primary wallet', description: `NGN${amount} ${network} airtime purchase reversal on ${phone}`, title: 'Fund Reversal'})
    
                                    reCredit ? setTimeout(() => resolve("done"), 9000) : setTimeout(() => reject( new Error(`Cannot re credit`)));
                                })
                                //update NewBills status 
                                NewBills.update({status: "FAILED"}, {where: {reference}})
                                return res.status(400).json({
                                    status: false,
                                    data : {
                                        network,
                                        phone,
                                        amount
                                    },
                                    message: "Cannot purchase airtime at the moment please try again later"
                    
                                })
                            } else if (buyAirtime.message == '') {
                                //update NewBills table
                                NewBills.update({
                                    status: "SUCCESS", transId: buyAirtime.request_id,
                                    
                                }, {where: {reference}})
                                return res.status(200).json({
                                    status: true,
                                    data: {
                                        network,
                                        amount,
                                        phone
                                    },
                                    message: "Hi padi, Successfully purchased"
                                })
                            }
                        }).catch(err => {
                            logger.info(err)
                            return res.status(400).json({
                                status: false,
                                data : err,
                                message: "Hi padi an error occurred"
    
                            })
                        })
    
                    }).catch(err => {
                        logger.info(err)
                        return res.status(400).json({
                            status: false,
                            data: err,
                            message: "Hi padi, cannot create this at this time"

                        })
                    })
                    // res.status(200).json({
                    //     status: true,
                    //     data: {},
                    //     message: "Hey padi, your request is successful"
                    // })
                    
                    
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
            message: "error occur"
        })
    }
})