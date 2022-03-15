const { config } = require("../../config");
const { Transactions, Users } = require("../../models");
const logger = config.logger

exports.transactions = ( async (req, res) => {

    const { userId } = req.user
    try
    {
        const transactions = await Transactions.findAll({

            attributes: ['transId', 'initialBal', 'amount', 'finalBal', 'description', 'from', 'to', 'direction', 'title', 'createdAt'],
            where: {userUid: userId},
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: ['fullName', 'imageUrl'],
                
               }]
        })
        return res.status(200).json({
            status: true,
            data : {

                transactions

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