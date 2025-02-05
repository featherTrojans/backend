const { config } = require("../../config");
const { Transactions, Users, Withdrawal } = require("../../models");
const {logger, Op} = config

exports.transactions = ( async (req, res) => {

    const { userId } = req.user
    let {page, data} = req.query
    try
    {

        page = page != null ? page : 1; data = data != null ? parseInt(data) : 30
        const limit = data
        const offset = page == 1 ? 0 : parseInt(data * (page - 1));

        let results = []
        const transactions = await Transactions.findAll({
            limit,
            offset,
            attributes: ['id','transId', 'initialBal', 'amount', 'finalBal', 'charges', 'description', 'from', 'to', 'direction', 'title', 'createdAt', 'trans_type'],
            where: {userUid: userId},
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: ['fullName', 'imageUrl'],
                
               }]
        })
        let otherUser;
        console.log('otherUser', otherUser)
        for (const [key, value] of Object.entries(transactions)){

            //get agentDetails
            if (value.dataValues.direction == 'out') {
                otherUser = await Users.findOne({
                    where: {[Op.or]: {
                        username: value.dataValues.to,
                        phoneNumber: value.dataValues.to
                    }},
                    attributes: ['fullName', 'imageUrl']
                })
            } else if (value.dataValues.direction == 'in') {
                otherUser = await Users.findOne({
                    where: {[Op.or]: {
                        username: value.dataValues.from,
                        phoneNumber: value.dataValues.from
                    }},
                    attributes: ['fullName', 'imageUrl']
                })
            }

            if (value.dataValues.title == 'Funds Transfer' || value.dataValues.title == 'withdrawal'){
                value.dataValues.bankDetails = await Withdrawal.findOne({ 
                    where: {reference: value.dataValues.transId}, 
                    attributes: ['account_number', 'account_name', 'bank_name']
                })
            }

            if ( otherUser != null ){
                value.dataValues.otherUser = otherUser
                results.push(value.dataValues)
            }
            // else if (bankDetails != null){
            //     value.dataValues.bankDetails = bankDetails
            //     results.push(value.dataValues)
            //     //set bankDetails to null
            //     bankDetails = null
            // }
             else {
                results.push(value.dataValues)
            }




        }

        return res.status(200).json({
            status: true,
            data : {

                transactions: results

            },
            message: "success"
        })


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});


exports.transactionBtwUSers = ( async (req, res) => {

    const { userId } = req.user
    const {phoneNumber } = req.params
    try
    {
        checkOtherUsername = await Users.findOne({
            where: {
                [Op.or]: {
                    username: phoneNumber,
                    phoneNumber: phoneNumber,
                    userUid: phoneNumber,
                },
            }
        })

        if ( checkOtherUsername == null ) {

            return res.status(409).json({
                status: false,
                data : {},
                message: "Hey padi, the user is not registered"
            })
        }
        let results = []
        const transactions = await Transactions.findAll({

            attributes: ['transId', 'initialBal', 'amount', 'finalBal', 'charges', 'description', 'from', 'to', 'direction', 'title', 'createdAt', 'trans_type'],
            where: {userUid: userId, 
                [Op.or]: {
                from: phoneNumber,
                to: phoneNumber,
            }},
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: ['fullName', 'imageUrl'],
                
               }]
        })
        let otherUser, bankDetails;
        for (const [key, value] of Object.entries(transactions)){

            //get agentDetails
            if (value.dataValues.direction == 'out') {
                otherUser = await Users.findOne({
                    where: {[Op.or] : {
                        username: value.dataValues.to,
                        phoneNumber: value.dataValues.to
                    }},
                    attributes: ['fullName', 'imageUrl']
                })
            } else if (value.dataValues.direction == 'in') {
                otherUser = await Users.findOne({
                    where: {[Op.or]: {
                        username: value.dataValues.from,
                        phoneNumber: value.dataValues.from
                    }},
                    attributes: ['fullName', 'imageUrl']
                })
            }

            if (value.dataValues.title == 'Funds Transfer' || value.dataValues.title == 'withdrawal'){
                bankDetails = await Withdrawal.findOne({ 
                    where: {reference: value.dataValues.transId}, 
                    attributes: ['account_number', 'account_name', 'bank_name']
                })
            }

            if ( otherUser != null ){
                value.dataValues.otherUser = otherUser
                results.push(value.dataValues)
            } else if (bankDetails != null){
                value.dataValues.bankDetails = bankDetails
                results.push(value.dataValues)
                //set bankDetails to null
                bankDetails = null
            } else {
                results.push(value.dataValues)
            }




        }

        return res.status(200).json({
            status: true,
            data : {

                transactions: results

            },
            message: "success"
        })


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
});