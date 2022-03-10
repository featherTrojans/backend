const { config } = require("../../config");
const { validationResult } = require('express-validator');
const { Request } = require("../../models");
const logger = config.logger


exports.createNegotiation = ( async (req, res) => {

    const { negotiatedFee, reference } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!negotiatedFee || !reference ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "negotiatedFee and reference is required"
            })
        } else {

            Request.update({negotiatedFee}, {where: {userUid: userId, reference}}).then((data) => {
                if (data[0] > 0 ) {
                    return res.status(200).json({
                        status: true,
                        data: {
                            negotiatedFee,
                            reference
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `No request ${reference}`
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