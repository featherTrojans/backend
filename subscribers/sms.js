const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter

const twilio = require('twilio')(config.twilio_sid, config.twilio_auth_token)



eventEmitter.on('signup', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "+234" + data.phoneNumber.substring(1) : data.phoneNumber;
    twilio.messages
    .create({
       body: message,
       from: config.twilio_sender_number,
       to: phone
     })
    .then(response => {
        logger.info(response.sid);
        logger.info(response.message)
        logger.info(message);
    }).catch(err => {
        logger.info(`Error: ${err}`)
    });


})

eventEmitter.on('send', async (data) => {
    //send sms
    const message = data.message;
    const phone = data.phoneNumber.length == 11 ? "+234" + data.phoneNumber.substring(1) : data.phoneNumber;
    twilio.messages
    .create({
       body: message,
       from: config.twilio_sender_number,
       to: phone
     })
    .then(response => {
        logger.info(response.sid);
        logger.info(response.message)
        logger.info(message);
    }).catch(err => {
        logger.info(`Error: ${err}`)
    });


})