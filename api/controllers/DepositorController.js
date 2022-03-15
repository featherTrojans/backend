const { Request, Users } = require("../../models");
const services = require("../../services/").services;
const {confirmData} = services

exports.getDepPendingRequests = (  async (req, res) => {

    const { userId } = req.user

    try
    {
        const {username} = await Users.findOne({where: {userUid: userId}})
        Request.findAll({
            attributes: ['userUid','reference', 'amount', 'charges', 'total','negotiatedFee', 'status', 'meetupPoint', 'createdAt' ],
            where: {agentUsername: username, status: 'PENDING'}
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
        const {username} = await Users.findOne({where: {userUid: userId}})
        Request.findAll({
            attributes: ['userUid','reference', 'amount', 'charges', 'total', 'status', 'meetupPoint', 'createdAt' ],
            where: {agentUsername: username, status: 'ACCEPTED'}
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
