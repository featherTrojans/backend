const { Users } = require("../../models")
const { config } = require("../../config")
const {logger} = config
const sequelize = require('sequelize')

exports.referralStats = (async (req, res) => {
    try{
        const { referredBy } = req.params
        const users = await Users.findAll({
            where: {referredBy},
            attributes: [[sequelize.fn('COUNT', sequelize.col('userUid')), 'totalUsers']]
        })
        const {totalUsers} = users[0].dataValues
        return res.status(200).json({
            status: true,
            data: {
                'totalReferred': totalUsers
            },
            message: 'success'
        })
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }

})