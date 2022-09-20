const { config } = require("../../config");
const { Transactions, Users, Withdrawal } = require("../../models");
const logger = config.logger

exports.transactions = ( async (req, res) => {

    const { userId } = req.user
    try
    {
        let results = []
        const transactions = await Transactions.findAll({

            attributes: ['transId', 'initialBal', 'amount', 'finalBal', 'charges', 'description', 'from', 'to', 'direction', 'title', 'createdAt'],
            where: {userUid: userId},
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
                    where: {username: value.dataValues.to},
                    attributes: ['fullName', 'imageUrl']
                })
            } else if (value.dataValues.direction == 'in') {
                otherUser = await Users.findOne({
                    where: {username: value.dataValues.from},
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
            }else if (bankDetails != null){
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
            message: "error occur"
        })
    }
});