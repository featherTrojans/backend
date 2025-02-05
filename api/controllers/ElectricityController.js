const {
    buyLight, 
    creditService,
    debitService,
    idGenService,
    timeService
} = require('../../services').services
const {Users, NewBills, DoubleSpent} = require('../../models')
const {logger} = require('../../config/').config
const bcrypt = require('bcryptjs');

exports.buyElect = ( async (req, res) => {

    const {userId, username} = req.user
    const { service, amount, meter_number, variation, phone , userPin} = req.body
    const charges = 100
    const totalAmount = parseFloat(charges) + parseFloat(amount)

    try{
        const {walletBal, pin} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal', 'pin']})
        const verifyPin = await bcrypt.compare(userPin, pin);
        if ( totalAmount > walletBal) {
            return res.status(400).json({
                status: false,
                data : {
                    service,
                    phone,
                    amount,
                    meter_number
                },
                message: "Cannot purchase electricity at the moment because your balance is not enough "

            })
        }else if (verifyPin != true ) {
            return res.status(403).json({

                status: false,
                data : {},
                message: "Pin is Incorrect"
    
            })
        } if ( variation.toLowerCase() != "prepaid") {
            return res.status(400).json({
                status: false,
                data : {},
                message: "Cannot purchase electricity at the moment for postpaid account at the moment "

            })
        } else{
        
            const reference = '8' + idGenService(7);
            const creditReference = 'FTHR' + idGenService(7)
            const transId =  timeService.serverTime().timeToUse + userId + walletBal;
            const insert = await DoubleSpent.create({
                transId,
                username,
                amount
            })
            if (insert) {
            new Promise(function(resolve, reject) {

                const debitUser = debitService({userUid: userId, reference, amount: totalAmount, charges, description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number}`, from: "primary wallet", to: "pay bills", title: "Utility Payment"});

                debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                // set timer to 7 secs to give room for db updates

            }).then(() => {

                NewBills.create({
                    userUid: userId,
                    amount,
                    beneficiary: meter_number,
                    reference,
                    transId: reference,
                    network: service,
                    description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number}`
                });

                buyLight({service, amount, meter_number, reference}).then((buyElect) =>{
                    if ( buyElect == false) {

                        //return charged amount
                        creditService({userUid: userId, reference: creditReference, amount, from: 'pay bills', to: 'primary wallet', description: `NGN${amount} ${variation} ${service} token reversal purchase on ${meter_number}`, title: 'Fund Reversal'})
                        //update NewBills status 
                        NewBills.update({status: "FAILED"}, {where: {reference}})
                        return res.status(400).json({
                            status: false,
                            data : {
                                service,
                                phone,
                                amount,
                                meter_number,
                                description: `NGN${amount} ${variation} ${service} token reversal purchase on ${meter_number}`,
                                transId,
                                createdAt: Date.now()
                            },
                            message: "Cannot purchase token at the moment please try again later"
            
                        })
                    } else {
                        //update NewBills table
                        NewBills.update({status: "SUCCESS", transId: buyElect.request_id, description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number} Token: ${buyElect.token}`}, {where: {reference}})
                        return res.status(200).json({
                            status: true,
                            data: {
                                service,
                                amount,
                                phone,
                                meter_number,
                                token: buyElect.token
                            },
                            message: `Successfully purchased Token: ${buyElect.token}`
                        })
                    }
                })

                
                
            }).catch(error => {
                logger.info(error)
                return res.status(400).json({
                    status: false,
                    data : error,
                    message: "Cannot create transaction"

                })
            });
        } else {
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