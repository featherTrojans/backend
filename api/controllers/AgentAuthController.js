const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { config } = require("../../config")
const {logger, Op, eventEmitter} = config
const {services} = require("../../services")
const { Agents } = require('../../models')
const {TokenServices} = services
require('../../subscribers')


exports.signup = ( async (req, res) => {

    try
    {
        const {...data} = req.body
        const userId = 'FGT' + services.idGenService(7)
        const errors = validationResult(req);
        const username = "feather" + services.codeGenerator(5);
        let {email, phoneNumber, firstName, lastName, password} = data
        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            const checkUsername = await services.confirmAgentData({data: username, type: 'username'});
            const checkEmail = await services.confirmAgentData({data: email, type: 'email'});
            const checkPhoneNumber = await services.confirmAgentData({data: phoneNumber, type: 'phoneNumber'});


            if (!(firstName && phoneNumber && email && lastName && password)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "Aww padi 🥲,All inputs are required"
                })

            } else if ( checkUsername != null ){
                const isVerified = checkUsername.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Aww padi 🥲!! Username already exist"
                }) 
            } else if (checkPhoneNumber != null ) {
                const isVerified = checkPhoneNumber.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Aww padi 🥲; Phone Number already exist"
                }) 
            }else if ( checkEmail != null ) {
                const isVerified = checkEmail.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Aww padi 🥲; Email already exist"
                }) 
            }
            else if ( checkUsername == null && checkEmail == null && checkPhoneNumber == null ) {

                code = services.codeGenerator(6)
                const fullName = lastName + " " + firstName
                const pwd = await bcrypt.hash(data.password, 10);
                const hashedPin = await bcrypt.hash("0000", 10);
                agentId = phoneNumber.substr(phoneNumber.length - 10)
                Agents.create({
                    userUid: userId,
                    agentId,
                    username,
                    fullName,
                    phoneNumber,
                    email,
                    code,
                    password: pwd,
                    pin: hashedPin,
                }).then( () => {

                    const message = `Dear ${fullName}, your verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                    eventEmitter.emit('signup', {code, phoneNumber, email, message})
                    const token = TokenServices({userId, username, email, fullName}, '262800h')
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
                        message: "Signed up Successfully 👍"
                    })

                }).catch((error) => {

                    logger.info(error)
                    return res.status(400).json({
                        status : false,
                        data: error,
                        message: "Cannot sign up 🥲"
                    })

                })

            } else {

                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Invalid data provided 🥲"
                }) 
            }

        }

    }
    catch (error) {

        logger.info(error)
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur 🥲"
        })
    }

})

exports.resendCode = ( async (req, res) => {
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
                message: "Aww padi 🥲; Email is required"
            }) 
        }else {
            code = await services.codeGenerator(6)
            const {fullName, phoneNumber, userUid, username} = await Agents.findOne({where: {email}})
            const userId = userUid
            Agents.update({
                code
            }, {where: {email}}).then( (data) => {

                logger.info(data);

                const message = `Dear ${fullName}, your verification code is: ${code}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
                eventEmitter.emit('signup', {code, phoneNumber, email, message})
                const token = TokenServices({userId, username, email, fullName}, '262800h')
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
                    message: "Code resent Successfully 👍"
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
            Agents.findOne({attributes: ['code'], where: {userUid: userId, code}})
            .then((data) => {

                if ( data.code != null && data.code == code ) {
                    
                    Agents.update(
                        { isVerified: true},
                        {where: {userUid: userId}}
                    )
                    const token = TokenServices({userId, username, email, fullName}, '262800h')
                    
                    return res.status(200).json({
                        status: true,
                        data : {
                            userId,
                            code,
                            token
                        },
                        message: "Your Phone number has been verified successfully 👍"
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

exports.completeReg = ( async (req, res) => {

    try
    {
        const {...data} = req.body
        const { userId, username, email, fullName } = req.user
        const errors = validationResult(req);
        let { 
            business_name,
            daily_transaction,
            business_category,
            full_address,
            bus_phone_number,
            charges_cat_one,
            charges_cat_two,
            charges_cat_three,
            charges_cat_four,
            messageToken
    
        } = data
        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {

            const checkbname = await services.confirmAgentData({data: business_name, type: 'bus_name'});
            const checkPhoneNumber = await services.confirmAgentData({data: bus_phone_number, type: 'b_phoneNumber'});


            if (!(business_name && daily_transaction && business_category && full_address && bus_phone_number && charges_cat_one && charges_cat_two && charges_cat_three && charges_cat_four)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "Aww padi 🥲,All inputs are required"
                })

            } else if ( checkbname != null ){
                const isVerified = checkUsername.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Aww padi 🥲!! Business has been taken"
                }) 
            } else if (checkPhoneNumber != null ) {
                const isVerified = checkPhoneNumber.isVerified
                return res.status(400).json({
                    status : false,
                    data: {
                        isVerified
                    },
                    message: "Aww padi 🥲; Phone Number cannot be reused"
                }) 
            } else if ( checkbname == null  && checkPhoneNumber == null ) {

                await Agents.update({
                    business_name,
                    daily_transaction,
                    business_category,
                    full_address,
                    bus_phone_number,
                    charges_cat_one,
                    charges_cat_two,
                    charges_cat_three,
                    charges_cat_four,
                    userLevel: 1,
                    messageToken
                }, {where: {userUid: userId}})
                const token = TokenServices({userId, username, email, fullName}, '262800h')
                    return res.status(202).json({
                        status : true,
                        data: {
                            userId,
                            fullName,
                            username,
                            email,
                            business_name,
                            daily_transaction,
                            business_category,
                            full_address,
                            bus_phone_number,
                            token
                        },
                        message: "Business Data updated Successfully 👍"
                    })

            } else {

                return res.status(404).json({
                    status : false,
                    data: {},
                    message: "Invalid data provided 🥲"
                }) 
            }

        }

    }
    catch (error) {

        logger.info(error)
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur 🥲"
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
            const checkUsername = await services.confirmAgentData({data: username, type: 'username'})
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
                Agents.update(
                    {password: pwd, isVerified: true, userLevel: 1, pin: hashedPin},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const message = `Dear ${fullName}, It is my pleasure to welcome you into this amazing community... 
                    Get cash easily without stress. Your username/tag is @${username}, you can change it to your desired one on the app. Welcome once again`

                    eventEmitter.emit('signupSuccess', {fullName, email, message}, fullName);
                    const token = TokenServices({userId, username, email, fullName}, '262800h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Password set successfully 👍"
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
            const checkUsername = await services.confirmAgentData({data: username, type: 'username'})
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
                Agents.update(
                   { pin: hashedPin},
                    {where: {userUid: userId}}
                ).then(()=>{
                    const token = TokenServices({userId, username, email, fullName}, '262800h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Pin set successfully 👍"
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
            const checkUsername = await services.confirmAgentData({data: username, type: 'username'})
            const checkNewUsername = await services.confirmAgentData({data: newUsername, type: 'username'})

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
                Agents.update(
                   { username: newUsername},
                    {where: {userUid: userId}}
                ).then(()=>{
                    username = newUsername
                    const token = TokenServices({userId, username, email, fullName}, '262800h')
                    return res.status(202).json({
                        status: true,
                        data: {
                            userId,
                            username,
                            token
                        },
                        message: "Username set successfully 👍"
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
                message: "All inputs are required"
            })

        } else{
            const checkUsername = await Agents.findOne({where: {
                [Op.or]: {
                    username,
                    phoneNumber: username,
                    agentId: username
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

                    const token = TokenServices({userId: userUid, username, email, fullName}, '262800h')
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
            message: "error occur"
        })
    }
}