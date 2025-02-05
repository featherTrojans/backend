const { config } = require('../config')
const {logger, eventEmitter} = config

const sendSMS = require('../services/middlewares/termiiService').sendSMS


const twilio = require('twilio')(config.twilio_sid, config.twilio_auth_token)


eventEmitter.on('signup', async (data) => {
    //send sms
    const message = data.message;
    // const phone = data.phoneNumber.length == 11 ? "+234" + data.phoneNumber.substring(1) : "+" + data.phoneNumber;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "OTP"})

    } catch (error) {
        logger.info(error)
    }


})

eventEmitter.on('changePassword', async (data) => {
    //send sms
    const message = data.message;
    // const phone = data.phoneNumber.length == 11 ? "+234" + data.phoneNumber.substring(1) : "+" + data.phoneNumber;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "OTP"})

    } catch (error) {
        logger.info(error)
    }


})

eventEmitter.on('send', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "Transaction"})
    } catch (error) {
        logger.info(error)
    }

    // twilio.messages
    // .create({
    //    body: message,
    //    from: config.twilio_sender_number,
    //    to: phone,
    //    messagingServiceSid: config.messagingServiceSid
    //  })
    // .then(response => {
    //     logger.info(response.sid);
    //     logger.info(response.message)
    //     logger.info(message);
    // }).catch(err => {
    //     logger.info(`Error: ${err}`)
    // });


})

eventEmitter.on('sendMessage', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "OTP"})
        console.log(`message ${message} sent to ${phone}`)
        return true
    } catch (error) {
        logger.info(error)
        return false
    }
});

eventEmitter.on('extraSms', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "Transaction"})
        console.log(`message ${message} sent to ${phone}`)
        return true
    } catch (error) {
        logger.info(error)
        return false
    }
});


eventEmitter.on('message', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "Transaction"})
        console.log(`message ${message} sent to ${phone}`)
        return true
    } catch (error) {
        logger.info(error)
        return false
    }
});

eventEmitter.on('signin', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "+234" + data.phoneNumber.substring(1) : data.phoneNumber;
    try {
        sendSMS({to: phone, message, type: "OTP"})

    } catch (error) {
        logger.info(error)
    }


})