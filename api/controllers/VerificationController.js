const { config } = require("../../config");
const {verifyBvn } = require('../../services/').services
const { validationResult } = require('express-validator')
const {logger} = config
const { Users, BVN } = require('../../models/')
const d = new Date();


exports.verifyUser = ( async (req, res) => {

    const { bvn, bank_name, acc_num } = req.body
    const {userId, fullName } = req.user
    const errors = validationResult(req);
    try
    {
        
    
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!bvn ) {
            
            return res.status(400).json({
                status: false,
                data: {},
                message: "Aww padi!!! BVN is required to verify you"
            })

        }else if (!bank_name ) {
            
            return res.status(400).json({
                status: false,
                data: {},
                message: "Aww padi!!! bank name is required to verify you"
            })

        }else if (!acc_num ) {
            
            return res.status(400).json({
                status: false,
                data: {},
                message: "Aww padi!!! Account Number is required to verify you"
            })

        } else {

            //verify
            const nameArray = fullName.split(" ");
            const first_name = nameArray[1];
            const last_name = nameArray[0];
            let verification = await verifyBvn(
                {
                    bvn, bank_name, acc_num, first_name, last_name
                });
            
            if (verification != false ) {
                // continue process
                //log data
                let insert = BVN.create({
                    userUid: userId,
                    bvn,
                    acc_num,
                    bank_name
                })

                if (insert) {
                    //upgrade user
                    let updated = Users.update({userLevel: 2}, {where: {userUid: userId}})
                    if (updated) {
                        return res.status(200).json({
                            status: true,
                            data: {},
                            message: "Hey Padi, Your verification process is complete and you have been upgraded to the ODOGWU Level...."
                        })
                    } else {
                        return res.status(400).json({
                            status: false,
                            data,
                            message: "Aww Padi Something came up. please try again later"
                        })
                    }
                } else {
                    return res.status(400).json({
                        status: false,
                        data: {},
                        message: "Aww Padi Something came up your data is incorrect please check and try again later"
                    })
                }

            } else {
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "Aww Padi Something came up your verification process is not completed please try again later"
                })
            }

        }
        

    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Aww Padi Something came up could not complete verification at the moment please try again later"
        })
    }
});