
const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter


eventEmitter.addListener('transfer', async (data) => {
    //send email
    logger.info(`email code: ${data.code} sent`);
})
