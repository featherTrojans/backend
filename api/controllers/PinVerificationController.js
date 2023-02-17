const { config } = require("../../config");
const { validationResult } = require('express-validator');
const { Users } = require("../../models");
const bcrypt = require('bcryptjs')
const logger = config.logger


exports.verifyPin = ( async (req, res) => {

    const { user_pin } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!user_pin) {

            return res.status(400).json({
                status: false,
                data: {},
                message: "user_pin is required"
            })

        } else {

            const { pin } = await Users.findOne({
                where: {userUid: userId},
                attributes: ['pin']
            });

            pin_verified = await bcrypt.compare(user_pin, pin);

            if (pin_verified) {

                return res.status(200).json({
                    status: true,
                    data : {},
                    message: "pin verified"
                })

            } else {

                return res.status(403).json({
                    status: false,
                    data : {},
                    message: "Unauthorized incorrect pin"
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