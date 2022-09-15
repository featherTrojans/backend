const { config } = require("../../config");
const { notificationService } = require("../../services/middlewares/notificationServices");
const {logger } = config


exports.sendPushNotification = (async (req, res) => {
    try {

        const { message, kind, subject } = req.body
        const auth = req.headers['auth_token']

        if ( auth == 'FeatherAdmin2022@'){
            //send push notification to all users
            notificationService({type: 'push', message, kind, subject})
            res.status(200).json({
                status: true,
                data: {},
                message: "Push notifications sent successfully"
            })
        } else {
            return res.status(403).json({
                status: false,
                data : {},
                message: "Cannot send notification"
            })
        }

    } catch (err) {
        console.log('error', err)
        return res.status(409).json({
            status: false,
            data : err,
            message: "error occur"
        })
    }
})

exports.sendSmsNotification = (async (req, res) => {
    try {

        const { message, kind, subject } = req.body
        const auth = req.headers['auth_token']

        if ( auth == 'FeatherAdmin2022@'){
            //send push notification to all users
            notificationService({type: 'sms', message, kind, subject})
            res.status(200).json({
                status: true,
                data: {},
                message: "Sms notifications sent successfully"
            })
        } else {
            return res.status(403).json({
                status: false,
                data : {},
                message: "Cannot send notification"
            })
        }

    } catch (err) {
        console.log('error', err)
        return res.status(409).json({
            status: false,
            data : err,
            message: "error occur"
        })
    }
})