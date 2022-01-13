const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter


eventEmitter.on('signup', async (code) => {
    //send sms
    logger.info(`sms code: ${code} sent`);
})