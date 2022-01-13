const { validationResult } = require('express-validator')
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

        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            const checkUsername = await services.confirmData({data: data.username, type: 'username'});
            const checkEmail = await services.confirmData({data: data.email, type: 'email'});
            const checkPhoneNumber = await services.confirmData({data: data.phoneNumber, type: 'phoneNumber'});

            if (!(data.username && data.phoneNumber && data.email && data.fullName)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "All input are required"
                })

            }else if ( checkUsername == null && checkEmail == null && checkPhoneNumber == null ) {

                code = services.codeGenerator(6)
                const phoneNumber = data.phoneNumber
                const username = data.username
                const fullName = data.fullName
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

                    eventEmitter.emit('signup', code)
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

                    logger.debug(error)
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

        logger.debug(error)
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }

})


exports.confirmCode = ( async (req, res) => {

    const {code} = req.body
    const {userId} = req.user
    try
    {
        Users.findOne({attributes: ['code'], where: {userUid: userId, code}})
        .then((data) => {

            if ( data.code == code ) {

                eventEmitter.emit('signupSuccess')
                return res.status(200).json({
                    status: true,
                    data : {
                        userId,
                        code
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
    catch(error) {
        
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }

})