const { config } = require("../config")
const { Status } = require("../models")
const {Op, logger } = config
const cron = require('node-cron');
var date = new Date();
var currentTime = date.getTime();
var yest = currentTime - ( 24 * 3600 * 1000)
const treatStatuses = async () => {
    try{
        logger.info('clearing statuses ....')
        const statuses = await Status.findAll({
            where: {updatedAt: {[Op.lte]: (yest)}, status: 'ACTIVE'}
        })

        if (statuses.length > 0){
            Status.update({status: 'EXPIRED'},{
                where: {updatedAt: {[Op.lte]: (yest)}, status: 'ACTIVE'}
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

// Schedule tasks to be run on the server.
// cron.schedule('* * * * *', function() {
//     treatStatuses()
//   });

treatStatuses()
