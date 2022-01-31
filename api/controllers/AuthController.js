const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { config } = require("../../config")
const logger = config.logger
const services = require("../../services").services
const Users = require("../../models/Users")
const TokenServices = services.TokenServices
require('../../subscribers')
const eventEmitter = config.eventEmitter



exports.signup = ( async (req, res) => {

    try
    {
        const {...data} = req.body
        const userId = services.idGenService(10)
        const refId = services.idGenService(7)
        const errors = validationResult(req);
        const username = "feather" + services.codeGenerator(5)

        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            const checkUsername = await services.confirmData({data: data.email, type: 'username'});
            const checkEmail = await services.confirmData({data: data.email, type: 'email'});
            const checkPhoneNumber = await services.confirmData({data: data.phoneNumber, type: 'phoneNumber'});

            if (!(username && data.firstName && data.phoneNumber && data.email && data.lastName)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "All input are required"
                })

            }else if ( checkUsername == null && checkEmail == null && checkPhoneNumber == null ) {

                code = services.codeGenerator(6)
                const phoneNumber = data.phoneNumber
                const fullName = data.lastName + " " + data.firstName
                const email = data.email


                Users.create({
                    userUid: userId,
                    username,
                    fullName,
                    phoneNumber,
                    email,
                    refId,
                    code
                }).then( () => {

                    const message = `Dear ${fullName}, your verification code is: ${code}. DO NOT DISCLOSE TO ANYONE`;
                    eventEmitter.emit('signup', {code, phoneNumber, email, message})
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(201).json({
                        status : true,
                        data: {
                            userId,
                            fullName,
                            username,
                            email,
                            phoneNumber,
                            token
                        },
                        message: "Signed up Successfully"
                    })

                }).catch((error) => {

                    logger.info(error)
                    return res.status(400).json({
                        status : false,
                        data: error,
                        message: "Cannot sign up"
                    })

                })

            } else {

                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Invalid data provided"
                }) 
            }

        }

    }
    catch (error) {

        logger.info(error)
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }

})


exports.confirmCode = ( async (req, res) => {

    const {code} = req.body
    const { userId, username, email, fullName } = req.user
    const errors = validationResult(req);
    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            Users.findOne({attributes: ['code'], where: {userUid: userId, code}})
            .then((data) => {

                if ( data.code != null && data.code == code ) {

                    eventEmitter.emit('signupSuccess')
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(200).json({
                        status: true,
                        data : {
                            userId,
                            code,
                            token
                        },
                        message: "Code validated successfully"
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
                    message: "error occur"
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



exports.setPassword = (async (req, res) => {
    const {password} = req.body
    const {userId, username, email, fullName} = req.user
    const errors = validationResult(req);

    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            const checkUsername = await services.confirmData({data: username, type: 'username'})
            logger.info(checkUsername);
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
                    {password: pwd},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Password set successfully"
                    })
                }).catch((err) => {
                    logger.info(err)
                    res.status(400).json({
                        status: false,
                        data: err,
                        message: "Cannot set password"
                    })
                })
            }
        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});



exports.setPin = (async (req, res) => {
    const {pin} = req.body
    const {userId, username, email, fullName} = req.user
    const errors = validationResult(req);

    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            const checkUsername = await services.confirmData({data: username, type: 'username'})
            logger.info(checkUsername);
            const hashedPin = await bcrypt.hash(pin, 10);
            
            if ( checkUsername == null) {

                return res.status(403).json({
                    status: false,
                    data : {},
                    message: "Unauthorized request"
                })
            } else {
                //set password in database
                Users.update(
                   { pin: hashedPin, userLevel: 1},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Pin set successfully"
                    })
                }).catch((err) => {
                    res.status(400).json({
                        status: false,
                        data: err,
                        message: "Cannot set pin"
                    })
                })
            }
        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});


exports.setUsername = (async (req, res) => {
    const {newUsername} = req.body
    let {userId, username, email, fullName} = req.user
    const errors = validationResult(req);

    try
    {

        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            const checkUsername = await services.confirmData({data: username, type: 'username'})
            const checkNewUsername = await services.confirmData({data: newUsername, type: 'username'})

            if ( checkUsername == null) {

                return res.status(403).json({
                    status: false,
                    data : {},
                    message: "Unauthorized request"
                })

            } else if (checkNewUsername != null){

                return res.status(400).json({
                    status: false,
                    data : {},
                    message: "Username has been taken"
                })

            } else {
                //set password in database
                Users.update(
                   { username: newUsername},
                    {where: {userUid: userId}}
                ).then(()=>{
                    username = newUsername
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Username set successfully"
                    })
                }).catch((err) => {
                    res.status(400).json({
                        status: false,
                        data: err,
                        message: "Cannot set username"
                    })
                })
            }
        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});


exports.signIn = async (req, res) => {
    const { username, password} = req.body
    const errors = validationResult(req);

    try{
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(username && password)){

            return res.status(400).json({
                status : false,
                data: {},
                message: "All input are required"
            })

        } else{
            const checkUsername = await services.confirmData({data: username, type: 'username'})
            if ( checkUsername == null) {
                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Invalid Username"
                })
            } else {
                const verifyPassword = await bcrypt.compare(password, checkUsername.password)
                const userId = checkUsername.userUid;
                const username = checkUsername.username
                const email = checkUsername.email;
                const fullName = checkUsername.fullName

                if (!verifyPassword ) {
                    return res.status(400).json({
                        status : false,
                        data: {},
                        message: "Incorrect password provided"
                    })
                } else {
                    
                    const token = TokenServices({userId, username, email, fullName}, '2h')
                    return res.status(200).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "User signed in successfully"
                    })
                }
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
}