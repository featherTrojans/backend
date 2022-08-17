const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services');
const { Users } = require("../../models");
const {verifyBvn, queryBvn} = services

exports.upgradeUser = (async (req, res) => {
    const errors = validationResult(req);
    const {userId, fullName} = req.user
    const {bvn, bank_name, acc_num, dob } = req.body

    try{
        const {phoneNumber, userLevel} = await Users.findOne({
            where: {
            userUid: userId
            },
            attributes: ['phoneNumber', 'userLevel']
        })

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!bvn) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "bvn is required"
            })
        } else if ( userLevel > 1 ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you have previously been verified"
            })
        }  else {
            // const first_name = (fullName.split(" "))[1];
            // const last_name = (fullName.split(" "))[0]
            // const verifyUser = await verifyBvn({bvn, bank_name, acc_num, first_name, last_name, userId, dob})
            
            const verifyUser = await queryBvn({bvn, userId, phoneNumber})
            if (verifyUser ){
                return res.status(200).json({
                    status: true,
                    data: {},
                    message: "Hey Padi!!! You have been verified succesfully and upgraded to Odogwu Level"
                })
            } else {
                return res.status(400).json({
                    status: false,
                    data: {verifyUser},
                    message: "Hi Padi, error occur could not verify you at the moment. Kindly try again"
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