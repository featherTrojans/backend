const { config } = require("../../config");
const { validationResult } = require('express-validator');
const { Users } = require("../../models");
const logger = config.logger


exports.createToken = ( async (req, res) => {

    const { messageToken } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!messageToken) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "messageToken is required"
            })
        } else {

            Users.update({messageToken}, {where: {userUid: userId}}).then((data) => {
                if (data[0] > 0 ) {
                    return res.status(200).json({
                        status: true,
                        data: {
                            messageToken,
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `No user ${userId}`
                    })
                }
            }).catch((err) => {
                logger.info(err)
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "error"
                })
            })


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