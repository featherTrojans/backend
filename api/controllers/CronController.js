const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const { treatRequests } = require("../../services/treatRequests");
const { treatStatuses } = require("../../services/treatStatuses");
const {timeService} = require("../../services").services


exports.CronController = (async (req, res) => {
    const errors = validationResult(req);

    try{
        // setInterval(() => console.log(timeService.serverTime().yesterday), 1000)
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        } else {
            treatRequests(timeService.serverTime().yesterday);
            treatStatuses()
            return res.status(200).json({
                message: "Crob job run successfully"
            })
        }

    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
})