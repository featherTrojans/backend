const { Op, Sequelize} = require('sequelize')
let sequelize = Sequelize
const {config} = require('../../config')
const { Users, UserLevels, Request, Transactions } = require("../../models")
const {logger} = config
exports.limitRange = (async (req, res) => {
    try {
        const {userId} = req.user
        let ts = Date.now();
        let d = new Date(ts);
        let year = String(d.getFullYear())
        let month = String(d.getMonth() + 1).padStart(2, '0')
        let day = String(d.getDate()).padStart(2, '0')
        let today = [year, month, day].join('-') + " 01:00:00"
        let thisMonth = [year, month, '01'].join('-') + " 01:00:00"

        //get users
        let userData =  await Users.findOne({
            where: {
                userUid: userId
            }
        })
        if (userData == null ) {
            return res.status(404).json({
                status: false,
                data: {},
                message: "Oops Padi, user does not exist"
            })
        } else {
            let {userLevel, username, phoneNumber} = userData
            let {privilege} = await UserLevels.findOne({
                where: {
                    level: userLevel
                }
            })

            privilege = JSON.parse(privilege)
            console.log(thisMonth)
            spentRequest = await Request.findAll(
                {
                    where: {
                        userUid: userId,
                        createdAt: {[Op.gte]: today},
                        status: {[Op.not]: "CANCELLED"}
                    },
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
                    ],
                }
            )

            console.log(spentRequest[0].dataValues.total_amount)

            spentTransfer = await Transactions.findAll(
                {
                    where: {
                        userUid: userId,
                        createdAt: {[Op.gte]: today},
                        from: [username, phoneNumber, userId]
                    },
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
                    ],
                }
            )

            monthSpentTransfer =  await Transactions.findAll(
                {
                    where: {
                        userUid: userId,
                        createdAt: {[Op.gte]: thisMonth},
                        from: [username, phoneNumber, userId]
                    },
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
                    ],
                }
            )


            return res.status(200).json({
                status: true,
                data: {
                    cashRequest: {
                        total: privilege.totalCashWithdrawal,
                        spent: (spentRequest).length > 0 ? spentRequest[0].dataValues.total_amount ?? 0 : 0
                    },
                    dailyTransfer: {
                        total: privilege.totalTransfer,
                        spent: spentTransfer.length > 0 ? spentTransfer[0].dataValues.total_amount ?? 0 : 0
                    },
                    monthlyTransfer: {
                        total: privilege.totalTransfer * 30,
                        spent: monthSpentTransfer.length > 0 ? monthSpentTransfer[0].dataValues.total_amount ?? 0 : 0
                    }
                },
                message: "Data retrieved successfully"
            })
        }
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
})