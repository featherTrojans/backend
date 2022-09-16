const { config } = require('../../config');
const { Users, UserLevels, Withdrawal, Request } = require('../../models');
const {logger, Op, environment } = config
const timeService = require('./timeservice')
const sequelize = require('sequelize')
const today = timeService.serverTime().fullYear

// console.log(today)

const LevelCheck = (async(req, res, next) =>{
    
    const {userId} = req.user
    const url = req.url
    const {amount} = req.body
    
    try
    {
      //get user level
        const {userLevel, walletBal } = await Users.findOne({where: {userUid: userId}})

        if (userLevel < 1) {
            return res.status(403).json({
                status: false,
                data: {},
                message: "You cannot perform this operation, Kindly, finish up registration"
            })
        }else {
            // get level details
            let {privilege} = await UserLevels.findOne({where: {level: userLevel}})
            // check type of operation
            // console.log ((url) == '/withdraw')
            console.log(privilege)
            console.log('url', url)
            privilege = JSON.parse(privilege)
            if (url == "/pay") {
                if (amount > privilege.funding){
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `You cannot fund amount greater than ${privilege.funding}`
                    })
                }else if ((parseFloat(walletBal) + parseFloat(amount)) > privilege.wallet ) {
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `Aww padi, You cannot have more than ${privilege.wallet}, fund with amount lesser than ${amount}`
                    })
                }
            }else if (url == '/withdraw') {
                const status = 'ON';

                const checkWithdrawals = await Withdrawal.findAll({
                    where: {user_uid: userId, createdAt: {[Op.substring]: `${timeService.serverTime().fullYear}`}, 
                    //createdAt: {[Op.lte]: `${today} 23:59:00`}
                },
                    attributes: [
                        [sequelize.fn('SUM', sequelize.col('amount')), 'totalWithdrawals'],
                    ]
                })
                const { totalWithdrawals } = checkWithdrawals[0].dataValues
                // console.log(totalWithdrawals);
                // console.log(parseFloat(amount + totalWithdrawals))
                // console.log(privilege.totalBankWithdrawal)
                // console.log(today)

                if (status == 'OFF') {
                    
                    return res.status(400).json({
                        status: false,
                        data: {},
                        message: "Hey padi bank transfers are not available at the moment. Kindly try again later"
                    });

                } else {

                    if (environment == 'live' && (parseFloat(walletBal)) > (privilege).wallet){
                        return res.status(403).json({
                            status: false,
                            data: {},
                            message: `Hi Padi, your account has been suspended, kindly upgrade to continue enjoying our services or contact support`
                        })
                    } else if (amount > privilege.bankWithdrawal){

                        return res.status(403).json({
                            status: false,
                            data: {},
                            message: `Aww padi, You cannot withdraw amount greater than NGN${privilege.bankWithdrawal}`
                        });

                    } else if ( (parseFloat(amount) + parseFloat(totalWithdrawals)) > privilege.totalBankWithdrawal) {
                        return res.status(403).json({
                            status: false,
                            data: {},
                            message: `Hey, padi you have passed the withdrawal threshold for today! Try again tomorrow.`
                        });
                    }
                }
                return next()
            }else if (url == '/request/create') {
                    //createdAt: {[Op.lte]: `${today} 23:59:00`}
                const checkRequests = await Request.findAll({
                    where: {userUid: userId, createdAt: {[Op.substring]: `${timeService.serverTime().fullYear}`}, status: {[Op.ne]: 'EXPIRED'}, status: {[Op.ne]: 'CANCELLED'}
                },
                    attributes: [
                        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRequests'],
                    ]
                })
                const { totalRequests } = checkRequests[0].dataValues
                console.log('totalRequests', totalRequests);
                console.log('total amount',parseFloat(amount) + parseFloat(totalRequests))
                console.log('total amount',(parseFloat(amount) + parseFloat(totalRequests)))
                console.log('privilege', privilege.totalCashWithdrawal)
                console.log(today)

                
                if (amount > privilege.cashWithdrawal){

                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `Aww padi, You cannot withdraw cash amount greater than NGN${privilege.cashWithdrawal}`
                    });

                } else if ( (parseFloat(amount) + parseFloat(totalRequests)) > privilege.totalCashWithdrawal) {
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `Hey, padi you have passed the cash withdrawal threshold for today! Try again tomorrow.`
                    });
                }
                
                return next()
            } else if ( url == '/transfer'){
                if (environment == 'live' && (parseFloat(walletBal)) > (privilege).wallet){
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `Hi Padi, your account has been suspended, kindly upgrade to continue enjoying our services or contact support`
                    })
                } else if (amount > privilege.transfer){
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `You cannot transfer amount greater than ${privilege.transfer}`
                    })
                }
            } else if ( url == '/status/create' || '/status/update') {
                if (amount > privilege.deposit){
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `You cannot create status of amount greater than ${privilege.deposit}`
                    })
                }
            } else if (url == '/status/find'){
                if (amount > privilege.cashWithdrawal){
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `You cannot withdraw amount greater than ${privilege.cashWithdrawal}`
                    })
                }
            }

        }
    } catch (err) {

        logger.info(err)
        return res.status(404).json({
            status: false,
            data: {},
            message: "User does not have the privilege"
        })
    }
    return next();
});


module.exports = LevelCheck
