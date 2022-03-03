const { config } = require("../../config");
const {withdrawFund, codeGenerator, debitService } = require('../../services/').services
const { validationResult } = require('express-validator')
const logger = config.logger
const { BankAccount, Users } = require('../../models/')


exports.withdrawFund = ( async (req, res) => {

    const { account_code, amount } = req.body
    const {userId, username } = req.user
    const errors = validationResult(req);
    try
    {
        const { walletBal } = await Users.findOne({attributes: ['walletBal'], where: {userUid: userId}})
    
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!account_code || !amount ) {
            
            return res.status(400).json({
                status: false,
                data: {},
                message: "account code and amount is required"
            })

        }else if ( walletBal < (amount + 50 )) {

            return res.status(400).json({
                status: false,
                data: {},
                message: "Insufficient balance"
            })

        } else {

            const reference = codeGenerator(14);
            const {account_number, account_name, bank_name} = await BankAccount.findOne({attributes: ['account_number', 'account_name', 'bank_name'], where: {account_code}});
            const description = `${username} withdrawal`;
            const debit = await debitService({userUid: userId, reference, amount: amount + 50, description, title: 'withdrawal', from: 'primary wallet', to: bank_name })

            if ( debit ) {


                const data = await withdrawFund({account_code, amount, user_uid: userId, reference, account_name, account_number, bank_name, narration: description});

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
                }else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: "withdrawal can not be made"
                    })
                }


            } else {
                return res.status(500).json({
                    status: false,
                    data: {},
                    message: "Could not debit "
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
});