const { validationResult } = require('express-validator')
const { config } = require("../../config")
const {logger, eventEmitter} = config
const {services} = require("../../services")
const Users = require("../../models/User")
const bcrypt = require('bcryptjs')
const {TokenServices} = services
require('../../subscribers')


exports.sendForgotPasswordCode = ( async (req, res) => {
    try {
        const { email } = req.body
        const errors = validationResult(req);

        
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else if (!(email) ){
            return res.status(400).json({
                status : false,
                data: {
                },
                message: "Email is required"
            }) 
        }else {
            code = await services.codeGenerator(6)
            const {fullName, phoneNumber, userUid, username} = await Users.findOne({where: {email}})
            const userId = userUid
            Users.update({
                code
            }, {where: {email}}).then( (data) => {

                logger.info(data);

                const message = `Dear ${fullName}, kindly use this  code : ${code} to complete your password change process. DO NOT DISCLOSE TO ANYONE`;
                eventEmitter.emit('changePassword', {code, phoneNumber, email, message})
                const token = TokenServices({userId, username, email, fullName}, '2h')
                return res.status(201).json({
                    status : true,
                    data: {
    
                        username,
                        email,
                        token
                    },
                    message: "Code sent Successfully"
                })

            }).catch((error) => {

                logger.info(error)
                return res.status(400).json({
                    status : false,
                    data: error,
                    message: "Cannot send code"
                })

            })

        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Something went wrong could not send code"
        })
    }
})


exports.setNewPassword = (async (req, res) => {
    const {password, code} = req.body

    const {userId, username, email, fullName} = req.user
    const errors = validationResult(req);

    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            const checkUsername = await services.confirmData({data: username, type: 'username'})
            const pwd = await bcrypt.hash(password, 10);
            
            if ( checkUsername == null) {

                return res.status(403).json({
                    status: false,
                    data : {},
                    message: "Unauthorized request"
                })
            } else {
                //set password in database
                Users.update(
                    {password: pwd, isVerified: true},
                    {where: {userUid: userId, code}}
                ).then(()=>{
                    const message = `Dear ${fullName}, Your password has been successfully changed. Kindly contact customer support if you didn't initiate this process`

                    eventEmitter.emit('changedPassword', {fullName, email, message});
                    eventEmitter.emit('notification', {userUid: userId, title: 'Password Changed', description: 'Hey padi, Your password has just been  changed. Kindly contact customer support if you didn\'t initiate this process'});
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Password changed successfully"
                    })
                }).catch((err) => {
                    logger.info(err)
                    res.status(400).json({
                        status: false,
                        data: err,
                        message: "Invalid code used"
                    })
                })
            }
        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});


exports.changePassword = (async (req, res) => {
    const {oldpassword, newpassword} = req.body

    const {userId, username, email, fullName} = req.user
    const errors = validationResult(req);

    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {

            const checkUsername = await services.confirmData({data: username, type: 'username'})
            const pwd = await bcrypt.hash(newpassword, 10);
            
            if ( checkUsername == null) {

                return res.status(403).json({
                    status: false,
                    data : {},
                    message: "Unauthorized request"
                })
            } else if (!(await bcrypt.compare(oldpassword, checkUsername.password))) {

                res.status(400).json({
                    status: false,
                    data: {},
                    message: "Incorrect password provided"
                })
            
            }  else {
                //set password in database
                Users.update(
                    {password: pwd, isVerified: true},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const message = `Dear ${fullName}, Your password has been successfully changed. Kindly contact customer support if you didn't initiate this process`

                    eventEmitter.emit('changedPassword', {fullName, email, message});
                    eventEmitter.emit('notification', {userUid: userId, title: 'Password Changed', description: 'Hey padi, Your password has just been  changed. Kindly contact customer support if you didn\'t initiate this process'});
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Password changed successfully"
                    })
                }).catch((err) => {
                    logger.info(err)
                    res.status(400).json({
                        status: false,
                        data: err,
                        message: "Incorrect password provided"
                    })
                })
            }
        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});


