const {
    buyLight, 
    creditService,
    debitService,
    idGenService
} = require('../../services').services
const {Users, Bills} = require('../../models')
const {logger} = require('../../config/').config

exports.buyElect = ( async (req, res) => {

    const {userId} = req.user
    const { service, amount, meter_number, variation, phone } = req.body

    try{
        const {walletBal} = await Users.findOne({where: {userUid: userId}, attributes: ['walletBal']})

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
        } else{
        
            const reference = 'FTHR' + await idGenService(7);
            const creditReference = 'FTHR' + await idGenService(7)
            new Promise(function(resolve, reject) {

                const debitUser = debitService({userUid: userId, reference, amount, description: `NGN${amount} ${variation} ${service} token purchased on ${meter_number}`, from: "primary wallet", to: "pay bills", title: "Electricity Bills"});

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