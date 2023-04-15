const { logger, merchant_url } = require("../../config").config;
const { Request } = require("../../models");
const fetchApi = require('node-fetch');

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

exports.sendRequestWebhook = (async (data) => {

    let resp = await fetchApi(`${merchant_url}/request/webhook`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    },
                body: JSON.stringify(
                    data
                )
            }
        )
    data = resp.json();
    console.log('request webhook: ', data)
})