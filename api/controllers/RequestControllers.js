const { config } = require("../../config");
const { Request } = require("../../models");
const logger = config.logger
const services = require("../../services").services


exports.getPendingRequests = ( async (req, res) => {
    const { userId } = req.user


    try
    {
        Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'createdAt' ],
            where: {userUid: userId, status: 'PENDING'}
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

exports.getAcceptedRequests = ( async (req, res) => {
    const { userId } = req.user


    try
    {
        Request.findAll({
            attributes: ['reference', 'amount', 'charges', 'total', 'agent', 'agentUsername', 'status', 'createdAt' ],
            where: {userUid: userId, status: 'ACCEPTED'}
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