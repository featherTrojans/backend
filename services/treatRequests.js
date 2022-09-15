const { config } = require("../config")
const { Request } = require("../models")
const refundUser = require("./middlewares/refundUser")
const {Op, logger } = config
const {timeService} = require("../services").services

var cron = require('node-cron');

const treatRequests = async (yesterday = timeService.serverTime().yesterday) => {
    try{
        logger.info('clearing request ....')
        const requests = await Request.findAll({
            where: {updatedAt: {[Op.lte]: (yesterday)}, status: ['ACCEPTED', 'PENDING'],}
        })
        
        if (requests.length > 0){
            
            Request.update({status: 'CANCELLED', reasonForCancel: 'Abandoned Request'},{
                where: {updatedAt: {[Op.lte]: (yesterday)}, status: ['PENDING', 'ACCEPTED']}
            })
            for (const [key, value] of Object.entries(requests)) {
                
                //refund withdrawer
                await refundUser(value.reference)

            }
            logger.info(`requests cleared successfully`)
        } else {
            logger.info('no request to treat')
        }

    }catch(err){

        logger.info(`clearing status error: ${err}`)

    }

}


// ...

// Schedule tasks to be run on the server.
cron.schedule('0 * * * *', function() {
    treatRequests()
});

// treatRequests()
