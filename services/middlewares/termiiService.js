const {
    logger,
    termii_key,
    termii_url,
} = require('../../config/').config

const fetch = require('node-fetch');


const fetchApiPost = async (data) => {
    try{
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      "Content-Type": "application/json",
                    },
            body: data.body 
        })
        console.log(data.body)

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
    var from = data.type == 'OTP' ? 'N-Alert' : 'Feather NG';
    var channel = data.type == "OTP" ? 'dnd' : 'generic'
    var url = `${termii_url}sms/send?to=${data.to}&from=${from}&sms=${data.message}&type=plain&channel=${channel}&api_key=${termii_key}`


    // console.log(body)

    const response = await fetchApiPost({url, body: null})
    logger.info(response)

}

// this.sendSMS({message: "Welcome to feather, with love from ezeko", to: 2347068006837})