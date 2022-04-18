const { config } = require("../config")
const { Request } = require("../models")
const refundUser = require("./middlewares/refundUser")
const {Op, logger, yesterday } = config

const treatRequests = async () => {
    try{
        logger.info('clearing request ....')
        const requests = await Request.findAll({
            where: {updatedAt: {[Op.gte]: (yesterday)}, status: 'PENDING',}
        })

        if (requests.length > 0){
            
            Request.update({status: 'CANCELLED', reasonForCancel: 'Abandoned Request'},{
                where: {updatedAt: {[Op.gte]: (yesterday)}, status: ['PENDING', 'ACCEPTED']}
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
// cron.schedule('* * * * *', function() {
//     treatStatuses()
//   });

treatRequests()
