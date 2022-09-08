const { config } = require("../../config");
const { Request, Users } = require("../../models");
const {logger, eventEmitter } = config
require('../../subscribers')

exports.sendPushNotification = (async (req, res) => {
    try {

        const { message, start, end } = req.body
        const auth = req.headers['auth_token']

        if ( auth == 'FeatherAdmin2022@'){
            //send push notification to all users
        } else {
            return res.status(400).json({
                status: false,
                data : {},
                message: "Cannot send notification"
            })
        }

    } catch (err) {
        console.log('error', err)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
})