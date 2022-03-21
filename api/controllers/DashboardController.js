const { config } = require("../../config");
const { Users, Transactions } = require("../../models");
const logger = config.logger

exports.dashboard = ( async (req, res) => {

    const { userId, username, email, fullName } = req.user
    try
    {
        const userDetails = await Users.findOne({attributes: {exclude: ['id', 'pin', 'pin_attempts', 'password', 'updatedAt', 'referredBy', 'code']}, where: {userUid: userId}});
        const bal = parseFloat(userDetails.walletBal) + parseFloat(userDetails.escrowBal) //wallet bal + escrow bal
        
        const transactions = await Transactions.findAll({
            attributes: ['transId', 'initialBal', 'amount', 'finalBal', 'description', 'from', 'to', 'direction', 'title', 'createdAt'],
            where: {userUid: userId},
            order: [['createdAt', 'DESC']],
            limit: 10,
            include: [{
                model: Users,
                attributes: ['fullName', 'imageUrl'],
                
               }]

        })
        return res.status(200).json({
            status: true,
            data : {

                userDetails,
                walletBal: bal,
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