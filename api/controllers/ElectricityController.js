const {
    buyLight, 
    creditService,
    debitService,
    idGenService
} = require('../../services').services
const {Users, Bills, DoubleSpent} = require('../../models')
const {logger} = require('../../config/').config
const bcrypt = require('bcryptjs');
const d = new Date();
let time = d.getTime();

exports.buyElect = ( async (req, res) => {

    const {userId, username} = req.user
    const { service, amount, meter_number, variation, phone , userPin} = req.body

    try{
        const {walletBal, pin} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal', 'pin']})
        const verifyPin = await bcrypt.compare(userPin, pin);
        if ( amount > walletBal) {
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
        } else{
        
            const reference = 'FTHR' + await idGenService(7);
            const creditReference = 'FTHR' + await idGenService(7)
            const transId =  time + userId + walletBal;
            const insert = await DoubleSpent.create({
                transId,
                username,
                amount
            })
            if (insert) {
            new Promise(function(resolve, reject) {

                const debitUser = debitService({userUid: userId, reference, amount, description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number}`, from: "primary wallet", to: "pay bills", title: "Utility Payment"});

                debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                // set timer to 7 secs to give room for db updates

            }).then(() => {

                Bills.create({
                    userUid: userId,
                    amount,
                    beneficiary: meter_number,
                    reference,
                    transId: reference,
                    network: service,
                    description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number}`
                });

                buyLight({phone,service, amount, meter_number, variation}).then((buyElect) =>{
                    if ( buyElect == false) {

                        //return charged amount
                        creditService({userUid: userId, reference: creditReference, amount, from: 'pay bills', to: 'primary wallet', description: `NGN${amount} ${variation} ${service} token reversal purchase on ${meter_number}`, title: 'Fund Reversal'})
                        //update bills status 
                        Bills.update({status: "FAILED"}, {where: {reference}})
                        return res.status(400).json({
                            status: false,
                            data : {
                                service,
                                phone,
                                amount,
                                meter_number
                            },
                            message: "Cannot purchase token at the moment please try again later"
            
                        })
                    } else {
                        //update bills table
                        Bills.update({status: "SUCCESS", transId: buyElect.request_id, description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number} Token: ${buyElect.token}`}, {where: {reference}})
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
            message: "error occur"
        })
    }
})