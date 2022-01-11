const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { config } = require("../../config")
const logger = config.logger
const services = require("../../services").services
const Users = require("../../models/Users")

exports.signup = ( async (req, res) => {

    logger.info("calling Sign up")
    try
    {
        const {...data} = req.body
        const userId = services.idGenService(10)
        const refId = services.idGenService(7)
        const errors = validationResult(req);

        if (!errors.isEmpty()) {

          return res.status(400).json({ errors: errors.array() });

        } else {

            const checkUsername = await services.confirmData({data: data.username, type: 'username'});
            const checkEmail = await services.confirmData({data: data.email, type: 'email'});
            const checkPhoneNumber = await services.confirmData({data: data.phoneNumber, type: 'phoneNumber'});

            const password = await bcrypt.hash(data.password, 10);

            if (!(data.username && data.phoneNumber && data.password && data.email && data.fullName)){
                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "All input are required"
                })
            }else if ( checkUsername == null && checkEmail == null && checkPhoneNumber == null ) {
                Users.create({

                    userUid: userId,
                    username: data.username,
                    fullName: data.fullName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    refId,
                    password

                }).then(() => {
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
                        data: {error},
                        message: "Cannot sign up"
                    })

                })

            } else {

                return res.status(409).json({
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