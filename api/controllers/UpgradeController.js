const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger, environment, eventEmitter} = config;
const {services} = require('../../services');
const { Users, BVN } = require("../../models");
const {verifyBvn, queryBvn} = services
require('../../subscribers')

exports.upgradeUser = (async (req, res) => {
    const errors = validationResult(req);
    const {userId, fullName} = req.user
    const {bvn, bank_name, acc_num, dob } = req.body

    const check = await BVN.findOne({where: {bvn}, attributes: ['bvn', 'isVerified', 'codeToSend', 'phoneNumber']})
console.log(check['isVerified'])
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
        }else if ( userLevel > 1 ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you have previously been verified"
            })
        } else if (check != null && check['isVerified']) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you can't verify with this bvn as it has already been previously used"
            })
        } else if (check != null && !check['isVerified']){
            // resend verification code
            phone = environment == 'live' ? check['phoneNumber'] : phoneNumber;
            codeToSend = check['codeToSend']
            message = `Hi Padi, your verification code to ugrade your account to Odogwu level is: ${codeToSend}. DO NOT DISCLOSE TO ANYONE`;
            const sendCode = await eventEmitter.emit('sendMessage', {
                phoneNumber: phone, message
            })
            console.log(sendCode)
            if (sendCode) {
                return res.status(200).json({
                    status: true,
                    data: {},
                    message: "Hey Padi!!! Your details has been recieved kindly verify the otp to be succesfully verified and upgraded to Odogwu Level"
                })
            } else {
                console.log(sendCode)
                return res.status(400).json({
                    status: false,
                    data: {verifyUser},
                    message: "Hi Padi, error occur could not verify you at the moment. Kindly try again"
                })
            }
        }   else {
            // const first_name = (fullName.split(" "))[1];
            // const last_name = (fullName.split(" "))[0]
            // const verifyUser = await verifyBvn({bvn, bank_name, acc_num, first_name, last_name, userId, dob})
            
            const verifyUser = await queryBvn({bvn, userId, phoneNumber})
            if (verifyUser ){
                return res.status(200).json({
                    status: true,
                    data: {},
                    message: "Hey Padi!!! Your details has been recieved kindly verify the otp to be succesfully verified and upgraded to Odogwu Level"
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