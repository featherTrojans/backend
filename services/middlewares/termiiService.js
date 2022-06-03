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
         logger.info(response);
         console.log(response)
        if (response.message == 'success') {
            return response.data
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

    var url = `${termii_url}sms/send`

    const body = ({
        api_key: termii_key,
        to: data.to,
        from : "Feather NG",
        sms: data.message,
        type: "plain",
        channel: "generic"
    })

    // console.log(body)

    const response = await fetchApiPost({url, body})
    logger.info(response)

}

// this.sendSMS({message: "Welcome to feather", to: "2347068006837"})