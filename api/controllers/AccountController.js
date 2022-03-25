const { config } = require("../../config");
const {confirmAccount, addAccount} = require('../../services/').services
const { validationResult } = require('express-validator')
const logger = config.logger


exports.getAccount = ( async (req, res) => {

    const { account_number, bank_name } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!account_number || !bank_name ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "account number and bank name is required"
            })
        } else {
            const account = await confirmAccount({ account_number });

            if (account == null) {
                const data = await addAccount({account_number, bank_name, user_uid: userId});
                if (data != false ){
                    return res.status(200).json({
                        status: true,
                        data,
                        message: "success"
                    })
                }else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: "account not found"
                    })
                }

            }else {
                return res.status(200).json({
                    status: true,
                    data : account,
                    message: "success"
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