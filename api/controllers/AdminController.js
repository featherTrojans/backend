const { config } = require("../../config")
const { Users, Payments, Request, Bills, Withdrawal, Transactions, Status, VfdPayment } = require("../../models")
const {logger} = config
const sequelize = require('sequelize')


exports.stats = ( async (req, res) => {
    try {
        config
        //users stats
        const users = await Users.findAll({
            where:{isVerified: true},
            attributes: [[sequelize.fn('SUM', sequelize.col('walletBal')), 'totalWalletBal'], [sequelize.fn('SUM', sequelize.col('escrowBal')), 'totalEscrowBal'], [sequelize.fn('COUNT', sequelize.col('userUid')), 'totalUsers']]
        })
        const { totalWalletBal, totalEscrowBal, totalUsers } = users[0].dataValues;

        const payments = await Payments.findAll({
            where: {isUsed: true},
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalFunding'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalFundingCount']]
        })
        const vfdPayments = await VfdPayment.findAll({
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalCollectFunding'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalCollectFundingCount']]
        })

        const {totalCollectFunding, totalCollectFundingCount} = vfdPayments[0].dataValues
        const {totalFunding, totalFundingCount} = payments[0].dataValues
        const allFunds = ( totalFunding != null ? parseFloat(totalFunding): 0) + (totalCollectFunding != null ? parseFloat(totalCollectFunding) : 0)
        const allFundsCount = parseFloat(totalFundingCount) + parseFloat(totalCollectFundingCount)


        const withdrawals = await Withdrawal.findAll({
            where: {status: 'SUCCESS'},
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalWithdrawal'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalWithdrawalCount']]
        })
        const {totalWithdrawal, totalWithdrawalCount} = withdrawals[0].dataValues

        const bills = await Bills.findAll({
            where: {status: ['SUCCESS', 'PROCESSING']},
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalBills'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalBillsCount']]
        })
        const {totalBills, totalBillsCount} = bills[0].dataValues

        const requests = await Request.findAll({
            where: {status: 'SUCCESS'},
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalRequests'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalRequestsCount']]
        })
        const {totalRequests, totalRequestsCount} = requests[0].dataValues

        const transactions = await Transactions.findAll({
            attributes: [ [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']]
        })
        const {totalTransactions} = transactions[0].dataValues

        const status = await Status.findAll({
            where: {status: 'ACTIVE'},
            attributes: [ [sequelize.fn('COUNT', sequelize.col('id')), 'totalActiveStatusCount'], [sequelize.fn('SUM', sequelize.col('amount')), 'totalActiveStatus']]
        })
        const {totalActiveStatus, totalActiveStatusCount} = status[0].dataValues

        const expiredStatus = await Status.findAll({
            where: {status: 'EXPIRED'},
            attributes: [ [sequelize.fn('COUNT', sequelize.col('id')), 'totalExpiredStatusCount'], [sequelize.fn('SUM', sequelize.col('amount')), 'totalExpiredStatus']]
        })
        const {totalExpiredStatus, totalExpiredStatusCount} = expiredStatus[0].dataValues

        return res.status(200).json({
            status: true,
            data: {
                users: {
                totalUsers,
                totalWalletBal: parseFloat(totalEscrowBal + 
                    totalWalletBal)
                },
                Funding: { 
                    value: allFunds ?? 0,
                    count: allFundsCount
                },
                Withdrawal: { 
                    value:totalWithdrawal ?? 0,
                    count: totalWithdrawalCount
                },
                Bills: {
                    value:totalBills ?? 0,
                    count:totalBillsCount
                },
                totalTransactions,
                Status: {
                    Active: {
                        value:totalActiveStatus ?? 0,
                        count: totalActiveStatusCount
                    },
                    Expired: {
                        value: totalExpiredStatus ?? 0,
                        count: totalExpiredStatusCount
                    }
                },
                Requests: {
                    value: totalRequests ?? 0,
                    count: totalRequestsCount ?? 0
                }

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
})