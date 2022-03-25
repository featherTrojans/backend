const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {Users, Status, Request, Transactions} = require('../../models/')
const {services} = require("../../services")
const {TokenServices} = services

const {logger, Op} = config
exports.getUser = ( async (req, res) => {

    const { username } = req.params
    try
    {
        const users = await  Users.findOne({where: {
            [Op.or]: {
                username,
                phoneNumber: username
            },
            },
            attributes: {exclude: ['id', 'pin', 'pin_attempts', 'password', 'updatedAt', 'referredBy', 'code']}
        });

        if (users == null) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `User ${username} does not exist`
            })
        }else {
            return res.status(200).json({
                status: true,
                data : users,
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

    const { newUsername, firstName, lastName } = req.body
    const {userId, username, email} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!newUsername || !firstName || !lastName) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "all fields are required"
            })
        } else {

            Users.update({username: newUsername, fullName: `${lastName} ${firstName}`}, {where: {userUid: userId}}).then((data) => {
                if (data[0] > 0 ) {
                    const token = TokenServices({userId, username: newUsername, email, fullName: `${lastName} ${firstName}`}, '6h')
                    Request.update({
                        agentUsername: newUsername,
                        agent: `${lastName} ${firstName}`
                    }, {where: {agentUsername: username}})

                    Transactions.update({to: newUsername}, {where: {to: username}})
                    Transactions.update({from: newUsername}, {where: {from: username}})

                    Status.update({username: newUsername, fullName: `${lastName} ${firstName}`}, {where: {username}}).then(() => {
                        logger.info('status username updated');
                    }).catch((err) => {
                        logger.info(err)
                    })

                    return res.status(200).json({
                        status: true,
                        data: {
                            username: newUsername,
                            fullName: `${lastName} ${firstName}`,
                            token
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
    const {userId, username} = req.user
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
                            username
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
  
        }else if (!newPassword || !oldPassword) {
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