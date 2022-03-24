const {
    buyAirtimeData, 
    creditService,
    debitService,
    idGenService
} = require('../../services').services
const {Users, Bills} = require('../../models')
const {logger} = require('../../config/').config
const bcrypt = require('bcryptjs');

exports.buyAirtime = ( async (req, res) => {

    const {userId} = req.user
    const { phone, network, amount, userPin } = req.body

    try{
        const {walletBal, pin} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal', 'pin']})
        const verifyPin = await bcrypt.compare(userPin, pin);

        if ( amount > walletBal) {
            return res.status(400).json({
                status: false,
                data : {
                    network,
                    phone,
                    amount
                },
                message: "Cannot purchase airtime at the moment because your balance is not enough "

            })
        }else if (verifyPin != true ) {
            return res.status(403).json({

                status: false,
                data : {},
                message: "Pin is Incorrect"
    
            })
        } else{
            const reference = 'FTH' + await idGenService(10);
            const creditReference = 'FTH' + await idGenService(10)
            new Promise(function(resolve, reject) {

                const debitUser = debitService({userUid: userId, reference, amount, description: `NGN${amount} ${network} airtime purchased on ${phone}`, from: "primary wallet", to: network, title: "Airtime Purchase"});

                debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                // set timer to 7 secs to give room for db updates

            }).then(() => {

                Bills.create({
                    userUid: userId,
                    amount,
                    beneficiary: phone,
                    reference,
                    transId: reference,
                    network,
                    description: `NGN${amount} ${network} airtime purchased on ${phone}`
                })
                buyAirtimeData({phone,network, amount, type: 'airtime'}).then((buyAirtime) => {
                    if ( buyAirtime == false) {

                        //return charged amount
                        creditService({userUid: userId, reference: creditReference, amount, from: 'pay bills', to: 'primary wallet', description: `NGN${amount} ${network} airtime purchase reversal on ${phone}`, title: 'Fund Reversal'})
                        //update bills status 
                        Bills.update({status: "FAILED"}, {where: {reference}})
                        return res.status(400).json({
                            status: false,
                            data : {
                                network,
                                phone,
                                amount
                            },
                            message: "Cannot purchase airtime at the moment please try again later"
            
                        })
                    } else {
                        //update bills table
                        Bills.update({status: "SUCCESS", transId: buyAirtime.request_id}, {where: {reference}})
                        return res.status(200).json({
                            status: true,
                            data: {
                                network,
                                amount,
                                phone
                            },
                            message: "Successfully purchased"
                        })
                    }
                })

                
                
            }).catch(error => {
                logger.debug(error)
                return res.status(400).json({
                    status: false,
                    data : error,
                    message: "Cannot create transaction"

                })
            });

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