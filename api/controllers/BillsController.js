const { logger } = require("../../config").config;
const { Bills } = require("../../models");

exports.allBills = ( async (req, res) => {

    const { userId } = req.user
    try
    {
        const transactions = await Bills.findAll({
            attributes: ['transId', 'network', 'amount', 'status', 'description', 'createdAt'],
            where: {userUid: userId},
            order: [['createdAt', 'DESC']],
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