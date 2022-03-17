const { Request, Users } = require("../../models");
const {logger} = require("../../config/").config

exports.getDepPendingRequests = (  async (req, res) => {

    const { userId } = req.user

    try
    {
        let {username} = await Users.findOne({where: {userUid: userId}})
        Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total','negotiatedFee', 'status', 'meetupPoint', 'createdAt' ],
            where: {agentUsername: username, status: 'PENDING'},
            include: {
                model: Users,
                attributes: ['fullName', 'username', 'phoneNumber'],
            }
        
        }).then ((data) => {
            return res.status(200).json({
                status: true,
                data,
                message: "success"
            })
        }).catch((error) => {
            return res.status(404).json({
                status: false,
                data : error,
                message: "Cannot get data"
            })
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

exports.getDepAcceptedRequests = (  async (req, res) => {

    const { userId } = req.user

    try
    {
        let {username} = await Users.findOne({where: {userUid: userId}})
        Request.findAll({
            attributes: ['userUid','reference', 'amount', 'charges', 'total', 'status', 'meetupPoint', 'createdAt' ],
            where: {agentUsername: username, status: 'ACCEPTED'},
            include: {
                model: Users,
                attributes: ['fullName', 'username', 'phoneNumber'],
            }
        }).then ((data) => {
            return res.status(200).json({
                status: true,
                data,
                message: "success"
            })
        }).catch((error) => {
            return res.status(404).json({
                status: false,
                data : error,
                message: "Cannot get data"
            })
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
