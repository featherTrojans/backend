const { BVN, Users } = require("../../models");
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
            BVN.findOne({attributes: ['codeToSend'], where: {userUid: userId, codeToSend: code}})
            .then((data) => {

                if ( data != null && data.codeToSend == code ) {
                    //upgrade user 
                    Users.update({userLevel: 2}, {where: {userUid: userId}})
                    BVN.update({isVerified: 1}, {where: {userUid: userId}});

                    return res.status(200).json({
                        status: true,
                        data : {
                        },
                        message: "Code validated successfully and you have successfully been upgraded to Odogwu level"
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