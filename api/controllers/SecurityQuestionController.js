const { config } = require("../../config");
const { Users } = require("../../models");
const { validationResult } = require('express-validator')
const {logger } = config


exports.createSecurityQuestions = async (req, res) => {
    const {secQue1, secQue2, secAns1, secAns2} = req.body;
    const { userId } = req.user
    const errors = validationResult(req);

    //checks
    try {
    if (!errors.isEmpty()) {

        return res.status(403).json({ errors: errors.array() });

      } else {
            let userCheck = await Users.findOne({
                where: {userUid: userId}
            })

          if (userCheck == null ) {
            res.status(403).json({
                status: false,
                data: {},
                message: "Aww padi, you are not authorized to perform this operation"
            })
          }else if (secQue1 == null || secQue1.length < 1 || secQue2 == null || secQue2.length < 1 || secAns1 == null || secAns1.length < 1 || secAns2 == null || secAns2.length < 1){
              res.status(400).json({
                  status: false,
                  data: {},
                  message: "Aww padi, All fields are required"
              })
          } else {
            //update user

            let updated =  await Users.update(
                {
                    secQueOne: secQue1, 
                    secAnsOne: secAns1, 
                    secQueTwo: secQue2, 
                    secAnsTwo: secAns2
                }, 
                {
                    where: {userUid: userId}
                }
            )
            console.log(updated)
            if (updated[0] > 0) {
                res.status(200).json({
                    status: 'true',
                    data: {},
                    message: "Hey padi, your security questions has been set successfully"
                })
            } else {
                res.status(400).json({
                    status: false,
                    data: {},
                    message: "Aww padi, an error occured could not set your security question"
                })
            }
          }
      }


    } catch (err) {
        logger.info(err)
        res.status(429).json({
            staus: false,
            data: err,
            message: "Aww padi, cannot process your request at the moment. Kindly contact support"
        })
    }
}