const { config } = require("../../config");
const {withdrawFund, codeGenerator, debitService, creditService } = require('../../services/').services
const { validationResult } = require('express-validator')
const {logger} = config
const { BankAccount, Users, DoubleSpent } = require('../../models/')
const d = new Date();
d.setSeconds(0,0)
let time = d.getTime();

exports.withdrawFund = ( async (req, res) => {

    const { account_code, amount } = req.body
    const {userId, username } = req.user
    const errors = validationResult(req);
    try
    {
        const { walletBal } = await Users.findOne({attributes: ['walletBal'], where: {userUid: userId}})
        let charges = amount <= 5000 ? 10 : amount <= 50000 ? 25 : 50

    
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!account_code || !amount ) {
            
            return res.status(400).json({
                status: false,
                data: {},
                message: "account code and amount is required"
            })

        }else if ( amount < 100) {

            return res.status(400).json({
                status: false,
                data: {},
                message: `You cannot withdraw NGN${charges}. Try NGN100 or more`
            })

        }else if ( walletBal < (parseFloat(amount) + charges )) {

            return res.status(400).json({
                status: false,
                data: {},
                message: `Insufficient balance, because a charge of NGN${charges} applies`
            })

        } else {

            const reference = codeGenerator(14);
            let debit;
                //check double spent
            const transId =  time + userId + walletBal;
            // console.log(transId)
            const insert = await DoubleSpent.create({
                transId,
                username,
                amount
            })
            if ( insert) {
                
                const {account_number, account_name, bank_name} = await BankAccount.findOne({attributes: ['account_number', 'account_name', 'bank_name'], where: {account_code}});

                const description = `${username} withdrawal`;

                await new Promise(function(resolve, reject) {

                    debit = debitService({userUid: userId, reference, amount: parseFloat(amount + charges), description, title: 'withdrawal', from: 'primary wallet', to: bank_name, charges })

                    debit ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                })

                if ( debit ) {

                    const data = await withdrawFund({account_code, amount, user_uid: userId, reference, account_name, account_number, bank_name, narration: description, charges});

                    if (data != false ){
                        return res.status(200).json({
                            status: true,
                            data: {
                                account_number,
                                account_code,
                                amount,
                                bank_name,
                                status: "PROCESSING",
                            },
                            message: "success"
                        })
                    } else {
                        //refund
                        creditService({userUid: userId, reference: "FTHRVRSL" + reference, amount: amount + charges, description: `NGN${amount} withdrawal reversal`, title: 'withdrawal', from: 'primary wallet', to: bank_name })

                        return res.status(404).json({
                            status: false,
                            data: {},
                            message: "Oops!! An error occur! withdrawal can not be made. Kindly try again later"
                        })
                    }


                } else {
                    return res.status(500).json({
                        status: false,
                        data: {},
                        message: "Could not debit "
                    })
                }
            } else {
                return res.status(400).json({
                    status: false,
                    data : {},
                    message: "Cannot create make withdrawal"
        
                })
            
            }

        }
        

    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Aww Padi Something came up could not complete withdrawal at the moment please try again later"
        })
    }
});