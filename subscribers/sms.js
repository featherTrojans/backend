const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter

const twilio = require('twilio')(config.twilio_sid, config.twilio_auth_token)



eventEmitter.on('signup', async (data) => {
    //send sms
    const message = `Dear ${data.fullName}, to complete your registration on the feather app, you are required to use this code: ${data.code} to complete your registration. DO NOT DISCLOSE TO ANYONE`;
    
    twilio.messages
    .create({
       body: message,
       from: config.twilio_sender_number,
       to: data.phoneNumber
     })
    .then(message => {
        logger.info(message.sid);
        logger.info(`sms code: ${data.code} sent; ${message}`);
    }).catch(err => {
        logger.info(`Error: ${err}`)
    });


})