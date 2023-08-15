const { BVN, Users, CollectionAccounts } = require("../../models");
const { validationResult } = require('express-validator')

exports.confirmBvnCode = ( async (req, res) => {

    const {code} = req.body
    const { userId } = req.user
    const errors = validationResult(req);
    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            BVN.findOne({attributes: ['codeToSend', 'bvn'], where: {userUid: userId, codeToSend: code}})
            .then((data) => {

                if ( data != null && data.codeToSend == code ) {
                    //upgrade user 
                    Users.update({userLevel: 2}, {where: {userUid: userId}})
                    BVN.update({isVerified: 1}, {where: {userUid: userId}});
                    CollectionAccounts.findOne({
                        where: {
                            bvn: data.bvn
                        },
                        attributes: ['firstname', 'middlename', 'lastname','accountNo']
                    }).then(accDet => {

                        return  accDet != null ? res.status(200).json({
                            status: true,
                            data : {
                                accountDetails: accDet
                            },
                            message: "Code validated successfully and you have successfully been upgraded to Odogwu level"
                        }): res.status(404).json({
                            status: false,
                            data: {},
                            message: "Hey padi, your code was not verified please try again"
                        })
                    }).catch(err => {
                        return res.status(400).json({
                            status: false,
                            data : err,
                            message: "Hi Padi, an error occurred"
                        })
                    })

                   

                } else {
                    return res.status(404).json({
                        status: false,
                        data : {},
                        message: "Code not valid"
                    })
                }
            })
            .catch((error) => {

                return res.status(403).json({
                    status: false,
                    data : error,
                    message: "Incorrect code used"
                })
            })
        }
    }
    catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Something went wrong could not confirm code"
        })
    }

})