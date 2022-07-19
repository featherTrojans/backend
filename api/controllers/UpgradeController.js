const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services')
const {verifyBvn} = services

exports.upgradeUser = (async (req, res) => {
    const errors = validationResult(req);
    const {userId, fullName} = req.user
    const {bvn, bank_name, acc_num, dob } = req.body

    try{

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!bvn) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "bvn is required"
            })
        }else if (!bank_name) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "bank name is required"
            })
        } else if (!acc_num) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "account number is required"
            })
        } else if (!dob) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Aww padi, you must provide your date of birth"
            })
        }  else {
            const first_name = (fullName.split(" "))[1];
            const last_name = (fullName.split(" "))[0]
            const verifyUser = await verifyBvn({bvn, bank_name, acc_num, first_name, last_name, userId, dob})
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