const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {  Rating } = require("../../models");
const { services } = require("../../services");
const {logger} = config
const { idGenService, creditService } = services


exports.rateUser = ( async (req, res) => {

    const { rating, description, userToRate, reference } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(rating || userToRate)) {

            return res.status(400).json({
                status: false,
                data: {},
                message: "rating and userToRate are required"
            })

        } else {

            const createRating = await Rating.create({
                userUid: userId,
                rating,
                description: description ?? null,
                userToRate,
                reference
            })

            if ( createRating ) {
                //credit the rater
                const transId = 'FTHRTNG' + idGenService(7)
                creditService({userUid: userId, reference: transId, amount: 10, description: `NGN10 Rating bonus from `, from: 'Bonus', to: 'primary wallet', title: 'Wallet Credit'});
                     
                return res.status(200).json({
                    status: true,
                    data : {},
                    message: "Rating done successfully verified"
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