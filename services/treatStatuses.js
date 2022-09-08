const { config } = require("../config")
const { Status } = require("../models")
const {Op, logger } = config
const cron = require('node-cron');
const {timeService} = require("../services").services

const treatStatuses = async (yesterday = timeService.serverTime().yesterday) => {
    try{
        logger.info('clearing statuses ....')
        const statuses = await Status.findAll({
            where: {updatedAt: {[Op.lte]: (yesterday)}, status: 'ACTIVE'}
        })

        if (statuses.length > 0){
            Status.update({status: 'EXPIRED'},{
                where: {updatedAt: {[Op.lte]: (yesterday)}, status: 'ACTIVE'}
            })
            logger.info(`statuses cleared successfully`)
        } else {
            logger.info('no status to treat')
        }

    }catch(err){

        logger.info(`clearing status error: ${err}`)

    }

}


// ...

// // Schedule tasks to be run on the server.
cron.schedule('30 * * * *', function() {
    treatStatuses()
});


// treatStatuses()
