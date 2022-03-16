const { config } = require("../../config");
const {confirmData} = require('../../services/').services
const { validationResult } = require('express-validator');
const {Users} = require('../../models/')

const {logger, Op} = config
exports.getUser = ( async (req, res) => {

    const { username } = req.params
    try
    {
        const users = await  Users.findOne({where: {
            [Op.or]: {
                username,
                phoneNumber: username
            }
        }});
        
        if (users == null) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `User ${username} does not exist`
            })
        }else {
            return res.status(200).json({
                status: true,
                data : {
                    user_id: users.user_Uid,
                    username: users.username,
                    fullName: users.fullName,
                    phoneNumber: users.phoneNumber,
                    email: users.email,
                    isVerified: users.isVerified,
                    userLevel: users.userLevel,
                    messageToken: users.messageToken,
                    imageUrl: users.imageUrl

                },
                message: "success"
            })
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

exports.updateBasicData = ( async (req, res) => {

    const { username, firstName, lastName } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!username || !firstName || !lastName) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "all fields are required"
            })
        } else {

            Users.update({username, fullName: `${lastName} ${firstName}`}, {where: {userUid: userId}}).then((data) => {
                if (data[0] > 0 ) {
                    return res.status(200).json({
                        status: true,
                        data: {
                        
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `No user ${userId}`
                    })
                }
            }).catch((err) => {
                logger.info(err)
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "error"
                })
            })


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

exports.updatePersonalData = ( async (req, res) => {

    const { gender, dateOfBirth, address, lga } = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!gender || !address || !lga || !dateOfBirth) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "all fields are required"
            })
        } else {

            Users.update({gender, address, dateOfBirth, lga}, {where: {userUid: userId}}).then((data) => {
                if (data[0] > 0 ) {
                    return res.status(200).json({
                        status: true,
                        data: {
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `No user ${userId}`
                    })
                }
            }).catch((err) => {
                logger.info(err)
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "error"
                })
            })


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


exports.changePassword = ( async (req, res) => {

    const { newPassword, oldPassword} = req.body
    const {userId} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!newPassword || !newPassword) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "all fields are required"
            })
        } else {

            Users.update({username, fullName: `${lastName} ${firstName}`}, {where: {userUid: userId}}).then((data) => {
                if (data[0] > 0 ) {
                    return res.status(200).json({
                        status: true,
                        data: {
                        
                        },
                        message: "success"
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `No user ${userId}`
                    })
                }
            }).catch((err) => {
                logger.info(err)
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "error"
                })
            })


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