const { validationResult } = require('express-validator')
const { config } = require("../../config")
const logger = config.logger
const services = require("../../services").services
const Users = require("../../models/Users")
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

                Users.create({
                    userUid: userId,
                    username: data.username,
                    fullName: data.fullName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    refId,
                    code
                }).then( () => {

                    eventEmitter.emit('signup', code)
                    return res.status(201).json({
                        status : true,
                        data: {
                            userId,
                            fullName: data.fullName,
                            username: data.username,
                            email: data.email,
                            phoneNumber: data.phoneNumber,
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