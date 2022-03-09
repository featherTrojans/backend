const { logger } = require("../../config").config;
const { Request } = require("../../models");

exports.getRequest = (  async (reference) => {

    try
    {
        
        const {status } = await Request.findOne({
            attributes: [ 'status' ],
            where: {reference}
        })
        return status
    } catch (error) {

        logger.info(error)
        return false
    }
});