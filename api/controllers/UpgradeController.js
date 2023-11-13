const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger, environment, eventEmitter, Op} = config;
const {services} = require('../../services');
const { Users, BVN } = require("../../models");
const {verifyBvn, queryBvn, createAccount} = services
require('../../subscribers')

exports.upgradeUser = (async (req, res) => {
    const errors = validationResult(req);
    const {userId} = req.user
    const {bvn, dob } = req.body

    const check = await BVN.findOne({where: {
            [Op.or]:{
                bvn,
                userUid: userId
            }
        }, attributes: ['bvn', 'isVerified', 'codeToSend', 'phoneNumber']})
// console.log(check['isVerified'])
    try{
        const {phoneNumber, userLevel, fullName, accountNo} = await Users.findOne({
            where: {
            userUid: userId
            },
            attributes: ['phoneNumber', 'userLevel', 'fullName', 'accountNo']
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
        }else if (accountNo != null && userLevel > 1) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you can't verify with this bvn. You have previously tried to verify with another bvn"
            })
        } else if (check != null && check['isVerified']) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you can't verify with this bvn as it has already been previously used"
            })
        } else if (accountNo != null && userLevel < 2){
            // resend verification code
            if (sendCode) {
                return res.status(200).json({
                    status: true,
                    data: {url: "https://services.vfdtech.ng/"},
                    message: "Hey Padi!!! Your details has been recieved kindly verify the otp to be succesfully verified and upgraded to Odogwu Level"
                })
            }
        }
        else if (check != null ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hi Padi, you can't be verified again. You have previously tried to verify"
            })
        }   else {
            const firstname = (fullName.split(" "))[1];
            const lastname = (fullName.split(" "))[0]
            // const verifyUser = await verifyBvn({bvn, bank_name, acc_num, first_name, last_name, userId, dob})
            
            const verifyUser = await createAccount({bvn, dob, userId, firstname, lastname, phone: phoneNumber })
            if (verifyUser ){
                return res.status(200).json({
                    status: true,
                    data: {"url": "https://services.vfdtech.ng/"},
                    message: "Hey Padi!!! Your details has been recieved kindly verify the otp to be succesfully verified and upgraded to Odogwu Level"
                })
            } else {
                return res.status(400).json({
                    status: false,
                    data: {verifyUser},
                    message: "Hi Padi, error occured could not verify you at the moment. Kindly try again"
                })
            }
        }

    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
})