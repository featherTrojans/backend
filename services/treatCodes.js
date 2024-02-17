const { config } = require("../config")
const { Request, Users } = require("../models")
const refundUser = require("./middlewares/refundUser")
const {Op, logger } = config
const timeService = require('./middlewares/timeservice')

var cron = require('node-cron');

const treatCodes = async (thirty_minutes_ago = timeService.serverTime().thirty_minutes_ago) => {

    try{

        logger.info('clearing code ....', thirty_minutes_ago)
        const codes = await Users.findAll({
            where: {updatedAt: {[Op.lte]: (thirty_minutes_ago)}, code: {
                [Op.not]: null
            }},
            attributes: ['code']
        })
        
        if (codes.length > 0){
            //clear code
            Users.update({code: null}, {
                where: {updatedAt: {[Op.lte]: (thirty_minutes_ago)}, code: {
                    [Op.not]: null
                }}

            })
            logger.info(`codes cleared successfully`)
        } else {
            logger.info('no request to treat')
        }

    }catch(err){

        logger.info(`clearing codes error: ${err}`)

    }

}


// ...

// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    treatCodes()
});

treatCodes()
