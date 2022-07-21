const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services')
const {createCollectionAccount} = services

exports.createCollectionAccountNum = (async (req, res) => {
    const errors = validationResult(req);
    const {userId} = req.user
    const {bvn, dob } = req.body

    try{

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!bvn) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "bvn is required"
            })
        } else if (!dob) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Aww padi, you must provide your date of birth"
            })
        }  else {
            const createAccount = await createCollectionAccount(({bvn, dob, userId}))
            console.log(createAccount)
            if (createAccount ){
                return res.status(200).json({
                    status: true,
                    data: {},
                    message: "Hey Padi!!! Your account has been created successfully"
                })
            } else {
                return res.status(400).json({
                    status: false,
                    data: {createAccount},
                    message: "Hi Padi, error occur could not crate your account at the moment. Kindly try again"
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