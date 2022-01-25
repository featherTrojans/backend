const { config } = require("../../config");
const { Users } = require("../../models");
const Transactions = require("../../models/Transactions");
const logger = config.logger

exports.dashboard = ( async (req, res) => {

    const { userId, username, email, fullName } = req.user
    try
    {
        const {walletBal} = await Users.findOne({attributes: ['walletBal'], where: {userUid: userId}})
        const transactions = await Transactions.findAll({
            attributes: ['transId', 'initialBal', 'amount', 'finalBal', 'description', 'from', 'to', 'direction', 'createdAt'],
            where: {userUid: userId}})
        return res.status(200).json({
            status: true,
            data : {
                userId,
                username,
                email,
                fullName,
                walletBal,
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