
const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter


eventEmitter.addListener('signup', async (data) => {
    //send email
    logger.info(`email code: ${data.code} sent`);
})

eventEmitter.addListener('signupSuccess', async () => {
    //send email
    logger.info(`Signup success email sent`);
})