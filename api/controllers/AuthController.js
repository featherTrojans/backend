const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { config } = require("../../config")
const {logger, Op, eventEmitter} = config
const {services} = require("../../services")
const { Users } = require('../../models')
const {TokenServices} = services
require('../../subscribers')


exports.signup = ( async (req, res) => {

    try
    {
        const {...data} = req.body
        const userId = services.idGenService(10)
        const refId = services.idGenService(7)
        const errors = validationResult(req);
        const username = "feather" + services.codeGenerator(5);
        let {email, phoneNumber, password, firstName, lastName,} = data
        const referredBy = !data.referredBy ? 'SETH' : data.referredBy;

        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            const checkUsername = await services.confirmData({data: username, type: 'username'});
            const checkEmail = await services.confirmData({data: email, type: 'email'});
            const checkPhoneNumber = await services.confirmData({data: phoneNumber, type: 'phoneNumber'});


            if (!(firstName && phoneNumber && email && lastName && password)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "All input are required"
                })

            } else if ( checkUsername != null ){
                const isVerified = checkUsername.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Username already exist"
                }) 
            } else if (checkPhoneNumber != null ) {
                const isVerified = checkPhoneNumber.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Phone Number already exist"
                }) 
            }else if ( checkEmail != null ) {
                const isVerified = checkEmail.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Email already exist"
                }) 
            }
            else if ( checkUsername == null && checkEmail == null && checkPhoneNumber == null ) {

                code = services.codeGenerator(6)
                const fullName = lastName + " " + firstName
                const pwd = await bcrypt.hash(password, 10);
                const hashedPin = await bcrypt.hash("0000", 10);

                Users.create({
                    userUid: userId,
                    username,
                    fullName,
                    phoneNumber,
                    email,
                    refId,
                    code,
                    referredBy,
                    password: pwd,
                    pin: hashedPin,
                }).then( () => {

                    // const message = `Dear ${fullName}, your verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                    // eventEmitter.emit('signup', {code, phoneNumber, email, message})
                    const token = TokenServices({userId, username, email, fullName}, '168h')
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
            message: "error occured"
        })
    }

})

exports.signupTwo = ( async (req, res) => {

    try
    {
        let {phoneNumber, referredBy} = req.body
        const userId = services.idGenService(10)
        const refId = services.idGenService(7)
        const errors = validationResult(req);
         referredBy = !referredBy ? 'SETH' : referredBy;

        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            // const checkUsername = await services.confirmData({data: username, type: 'username'});
            // const checkEmail = await services.confirmData({data: email, type: 'email'});
            const checkPhoneNumber = await services.confirmData({data: phoneNumber, type: 'phoneNumber'});


            if (!( phoneNumber)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "All input are required"
                })

            }  else if (checkPhoneNumber != null ) {
                const isVerified = checkPhoneNumber.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Phone Number already exist"
                }) 
            } else if (  checkPhoneNumber == null ) {

                code = services.codeGenerator(6)
                const hashedPin = await bcrypt.hash("0000", 10);

                Users.create({
                    userUid: userId,
                    phoneNumber,
                    refId,
                    code,
                    referredBy,
                    pin: hashedPin,
                }).then( () => {

                    const message = `Hey padi, your verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                    eventEmitter.emit('signup', {code, phoneNumber, message})
                    const token = TokenServices({userId}, '168h')
                    return res.status(201).json({
                        status : true,
                        data: {
                            userId,
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
            message: "error occured"
        })
    }

})

exports.resendCode = ( async (req, res) => {
    try {
        const { detail } = req.body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else if (!(detail) ){
            return res.status(400).json({
                status : false,
                data: {
                    
                },
                message: "detail is required"
            }) 
        }else {
            code = services.codeGenerator(6)
            const {phoneNumber, userUid} = await Users.findOne({where: {[Op.or]: {
                email: detail,
                phoneNumber: detail
            } }})
            const userId = userUid
            Users.update({
                code
            }, {where: {[Op.or]: {
                email: detail,
                phoneNumber: detail
            } }}).then( (data) => {

                logger.info(data);

                const message = `Hey padi, your verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                eventEmitter.emit('signup', {code, phoneNumber, message})
                const token = TokenServices({userId}, '168h')
                return res.status(201).json({
                    status : true,
                    data: {
                        userId,
                        phoneNumber,
                        token
                    },
                    message: "Code resent Successfully"
                })

            }).catch((error) => {

                logger.info(error)
                return res.status(400).json({
                    status : false,
                    data: error,
                    message: "Cannot resend code"
                })

            })

        }
    } catch(error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Something went wrong could not resend code"
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
            logger.info({ errors: errors.array() })
            return res.status(403).json({ message: "Hey padi something is wrong, kindly try again!" });
  
        } else {
            Users.findOne({attributes: ['code'], where: {userUid: userId, code}})
            .then((data) => {

                if ( code != null && code == code ) {
                    
                    Users.update(
                        { isVerified: true, userLevel: 1},
                        {where: {userUid: userId}}
                    )
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
                const hashedPin = await bcrypt.hash("0000", 10);
                Users.update(
                    {password: pwd, isVerified: true, userLevel: 1, pin: hashedPin},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const message = `Dear ${fullName}, It is my pleasure to welcome you into this amazing community... 
                    Get cash easily without stress. Your username/tag is @${username}, you can change it to your desired one on the app. Welcome once again`

                    eventEmitter.emit('signupSuccess', {fullName, email, message}, fullName);
                    const token = TokenServices({userId, username, email, fullName}, '168h')
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
            message: "error occured"
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
            const checkUsername = await Users.findOne({
                where: {
                    userUid: userId
                }
            })
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
                   { pin: hashedPin},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const token = TokenServices({userId, username, email, fullName}, '168h')
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
            message: "error occured"
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
            // const checkUsername = await services.confirmData({data: username, type: 'username'})
            const checkNewUsername = await services.confirmData({data: newUsername, type: 'username'})

            // if ( checkUsername == null) {

            //     return res.status(403).json({
            //         status: false,
            //         data : {},
            //         message: "Unauthorized request"
            //     })

            // } else 
            if (checkNewUsername != null){

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
                    const token = TokenServices({userId, username, email, fullName}, '168h')
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
            message: "error occured"
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
            const checkUsername = await Users.findOne({where: {
                [Op.or]: {
                    username,
                    phoneNumber: username
                }
            }})
            if ( checkUsername == null) {
                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Incorrect feather tag/ username"
                })
            } else {
                let {userUid, username, email, fullName, isLoggedIn} = checkUsername
                const verifyPassword = await bcrypt.compare(password, checkUsername.password)
                username = username.toLowerCase()

                // console.log(parseFloat(walletBal))
                // console.log(JSON.parse(privilege).wallet)
                if (isLoggedIn) {
                    return res.status(400).json({
                        status : false,
                        data: {},
                        message: "Aww padi! You are logged in on another device"
                    })
                } else if (!verifyPassword ) {
                    return res.status(400).json({
                        status : false,
                        data: {},
                        message: "Incorrect password provided"
                    })
                }else {

                    const token = TokenServices({userId: userUid, username, email, fullName}, '168h')
                    return res.status(200).json({
                        status: true,
                        data: {
                            userId: userUid,
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
            message: "error occured"
        })
    }
}

exports.signInTwo = async (req, res) => {
    const { username } = req.body
    const errors = validationResult(req);

    try{
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(username)){

            return res.status(400).json({
                status : false,
                data: {},
                message: "Aww padi! Kindly Input your phone number or feather tag to login"
            })

        } else{
            const checkUsername = await Users.findOne({where: {
                [Op.or]: {
                    username,
                    phoneNumber: username
                },
            }})
            if ( checkUsername == null) {
                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Aww padi! Incorrect feather tag/ phone number"
                })
            } else {

                const {isLoggedIn, phoneNumber, fullName, userUid} = checkUsername

                if (isLoggedIn) {
                    return res.status(400).json({
                        status : false,
                        data: {},
                        message: "Aww padi! You are logged in on another device"
                    })
                } else {
                    code = services.codeGenerator(6)
                    //update code
                    Users.update({code}, {where: {userUid}})
                    const message = `Dear ${fullName}, your login verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                    eventEmitter.emit('signin', {code, phoneNumber, message})
                    res.status(200).json({
                        status: true,
                        data: {},
                        message: "Hello padi, your OTP has been sent successfully"
                    })
                }
            }
        }
    } catch (error) {

        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
}

exports.confirmLoginCode =  async ( req, res) => {

    try {
        const {code} = req.body
        
        if (code === null || code === '') {
            return res.status(400).json({
                status: false,
                data: {},
                message: 'Aww padi, code cannot be empty'
            })
        } else  {
            const checkUser = await Users.findOne({
                where: {code}
            })
            console.log (checkUser)

            if (checkUser === null) {
                return res.status(404).json({
                    status: false,
                    data: {},
                    message: 'Aww padi, the code you entered is invalid, please retry'
                })
            } else{
                const {userUid, username, email, fullName} = checkUser;  
                const token = TokenServices({userId: userUid, username, email, fullName}, '168h') // set token to 12 years
                // set isLoggedIn to true
                // Users.update(
                // {
                //     isLoggedIn: true
                // },
                // {where: {userUid}})
                return res.status(200).json({
                    status: true,
                    data: {
                        userId: userUid,
                        username,
                        token
                    },
                    message: "Hey padi, you have signed in successfully"
                })
            }
            
        }
    }catch ( error) {
        logger.info('error', error)
        return res.status(409).json({
            status: false,
            data: {},
            message: "Aww padi,An error occured. Contact support"
        })
    }


}

exports.confirmRegisterCode =  async ( req, res) => {

    try {
        const {code} = req.body
        if (code === null || code === '') {
            return res.status(400).json({
                status: false,
                data: {},
                message: 'Aww padi, code cannot be empty'
            })
        } else  {
            const checkUser = await Users.findOne({
                where: {code}
            })
            console.log (checkUser)

            if (checkUser === null) {
                return res.status(404).json({
                    status: false,
                    data: {},
                    message: 'Aww padi, the code you entered is invalid, please retry'
                })
            } else{
                const {userUid} = checkUser;  
                const token = TokenServices({userId: userUid}, '168h') // set token to 12 years
                // set isLoggedIn to true
                Users.update(
                {
                    isVerified: true
                },
                {where: {userUid}})
                return res.status(200).json({
                    status: true,
                    data: {
                        userId: userUid,
                        token
                    },
                    message: "Hey padi, Your registeration is successful"
                })
            }
            
        }
    }catch ( error) {
        console.log('error', error)
        return res.status(409).json({
            status: false,
            data: {},
            message: "Aww padi,An error occured. Contact support"
        })
    }


}