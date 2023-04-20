const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {Users, Status, Request, Transactions} = require('../../models/')
const {services} = require("../../services")
const {TokenServices} = services
const fetchAPi = require('node-fetch')

const {logger, Op, merchant_url, environment} = config
exports.getUser = ( async (req, res) => {

    const { username } = req.params
    try
    {
        const users = await  Users.findOne({where: {
            [Op.or]: {
                username,
                phoneNumber: username,
                userUid: username,
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

exports.getUserWtoutLog = ( async (req, res) => {

    const { username } = req.params
    try
    {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        console.log('environment: ', environment)
        console.log('environment _ip: ', ip)
        if (environment == 'live') {
            if ( (ip != '::ffff:54.86.238.137' && ip != '::ffff:44.195.222.116' && ip != '::ffff:191.101.42.78') ) {
            
                // logger.info('Auth Token  not correct')
                logger.info("Unauthorized request")
                return res.status(403).json({
                    message: 'invalid request, unauthorized caller'
                })
            } else {
                const user = await  Users.findOne({where: {
                    [Op.or]: {
                        username,
                        phoneNumber: username,
                        userUid: username,
                    },
                    },
                    attributes: {exclude: ['id', 'pin', 'pin_attempts', 'password', 'updatedAt', 'referredBy', 'code']}
                });
        
                if (user == null) {
                    return res.status(404).json({
                        status: false,
                        data: {},
                        message: `User ${username} does not exist`
                    })
                }else {
                    return res.status(200).json({
                        status: true,
                        data : user,
                        message: "success"
                    })
                }
        
            }
         } else {
            return res.status(403).json({
                message: 'invalid request, unauthorized caller'
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


exports.getMerchant = ( async (req, res) => {

    const { username } = req.params
    try
    {
        

        if (username == null) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `Hey padi all fields are required`
            })
        }else {
            merchant = await fetchAPi(`${merchant_url}/agent/get/${username}`)
            merchant = await merchant.json()
            console.log('merchant', merchant)
            return res.status(merchant.status ? 200: 400).json(merchant)
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

exports.getMultipleUser = ( async (req, res) => {

    const  {numbers} = req.body
    let username;
    console.log(numbers)
    try
    {
        let result = [];
        for (let i = 0; i < numbers.length; i++){
            username = numbers[i].length > 11 ? '0' + numbers[i].substr(numbers[i].length - 10) : numbers[i]

            let users = await  Users.findOne({where: {
                [Op.or]: {
                    username,
                    phoneNumber: username,
                    userUid: username,
                },
                },
                attributes: {exclude: ['id', 'pin', 'pin_attempts', 'password', 'updatedAt', 'referredBy', 'code']}
            });
    
            if (users == null) {
                //not a registered user 
                continue;
            }else {
                result.push(users)
            }
        }
        return res.status(200).json({
            status: true,
            data : result,
            message: "success"
        })



    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});
