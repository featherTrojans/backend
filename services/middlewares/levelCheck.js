const { config } = require('../../config');
const { Users, UserLevels } = require('../../models');
const logger = config.logger



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
            console.log ((url) == '/withdraw')
            console.log(privilege)
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
                        message: `You cannot have more than ${privilege.wallet}, fund with amount lesser than ${amount}`
                    })
                }
            }else if (url == '/withdraw') {
                const status = 'OFF';
                console.log(status)
                if (status == 'OFF') {
                    
                    return res.status(400).json({
                        status: false,
                        data: {},
                        message: "Hey padi bank transfers are not available at the moment. Kindly try again later"
                    });

                } else if (amount > privilege.cashWithdrawal){

                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: `You cannot withdraw amount greater than ${privilege.cashWithdrawal}`
                    });

                }
            } else if ( url == '/transfer'){
                if (amount > privilege.transfer){
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
