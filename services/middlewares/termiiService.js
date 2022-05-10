const {
    logger,
    termii_key,
    termii_url
} = require('../../config/').config

const fetch = require('node-fetch');


const fetchApiPost = async (data) => {
    try{
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      "Content-Type": "application/json"
                    },
            body: data?.body ?? ''
        })
        // console.log(response)

        response = await response.json()
        //  logger.info(response);
        if (response.message == 'success') {
            logger.info(response)
            return response.details
        } else {
            logger.info(response)
            return false
        }
    } catch (err) {
        logger.info(err);
        return false
    }

}

exports.sendSMS = async (data) => {

    $url = `${termii_url}api/sms/send`

    const body = JSON.stringify({
        api_key: termii_key,
        to: data.to,
        from : "Feather NG",
        sms: data.message,
        type: "plain",
        channel: "generic"
    })

    const response = await fetchApiPost({url, body})
    console.log(response)

}