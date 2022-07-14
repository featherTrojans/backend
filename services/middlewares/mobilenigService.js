const {
    logger,
    mobilenig_pk_key,
    mobilenig_sk_key,
    mobilenig_url
} = require('../../config/').config

const fetch = require('node-fetch');


const fetchApi = async (url) => {
    try{
        let data =  await fetch(url, {
            headers: {Authorization: `Bearer ${mobilenig_pk_key}`,
                        "Content-Type": "application/json"
                    } 
        })
         data = await data.json()
        logger.info(data)
        if (data.message == 'success') {
            // logger.info(data)
            return data.data
        } else {
            // logger.info(data)
            return false
        }
    } catch (err) {
        logger.info(err);
        return false
    }

}

const getServiceId = (network) => {
    switch (network) {
        case "mtn": return 'BAD'; break;
        case "glo": return "BAB"; break;
        case "airtel": return "BAA"; break;
        case "9mobile": return "BAC"; break;
        default: return "BAE"
    }
}

const fetchApiPost = async (data) => {
    try{
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {Authorization: `Bearer ${data.key}`,
                      "Content-Type": "application/json"
                    },
            body: data?.body ?? ''
        })
        console.log(data.body)

        response = await response.json()
        //  logger.info(response);
        console.log('response', response)
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

exports.getBalance = async () => {
    var url = `${mobilenig_url
    }control/balance`

    const data = await fetchApiPost({url, key: mobilenig_pk_key})

    if (data !== false){
        return data
    }else{
        return false
    }
}

exports.getWalletHistory = async (start, end) => {
    var url = `${mobilenig_url
    }control/wallet_history?page=${start}&per_page=${end}`

    const data = await fetchApi(url)
    logger.info(data)
    if (data !== false){
        return data
    }else{
        return false
    }

}

exports.buyAirtimeData = async ({phone, network, amount, type, trans_id}) =>{

    if (type == 'airtime') {
        //buy airtime for user
        var url = `${mobilenig_url}services/`
        const body = JSON.stringify({
            "service_id": getServiceId(network),
            trans_id,
            "service_type": "STANDARD",
            "phoneNumber": phone,
            amount
        })
        const data = await fetchApiPost({url, key: mobilenig_sk_key, body})
        console.log('data', data)
        if (data !== false){
            /**
             * data {
                trans_id: '9VOwZVJ5lj',
                service: 'VisaphoneVtu',
                details: {
                    amount: '100',
                    phoneNumber: '07068006837',
                    referenceID: '9VOwZVJ5lj'
                },
                wallet_balance: '499904'
                }
             */
            return data
        }else{
            return false
        }
    } else if (type == 'data') {
        var url = `${paygold_url}data?username=${paygold_username}&password=${paygold_pass}&network_id=${network}&phone=${phone}&variation_id=${amount}`

        const data = await fetchApi(url)
        if (data !== false){
            /**
             * 
             * {"code":"success","message":"Data successfully delivered","data":{"network":"MTN","data_plan":"MTN Data 1GB (SME) – 30 Days","phone":"07045461790","amount":"NGN319","request_id":"fb69ed8a39ac5684"}}
             */
            return data
        }else{
            return false
        }
    } else {

        return false

    }
}

exports.buyLight = async({service, amount, meter_number, variation, phone}) => {

    var url = `${paygold_url}electricity?username=${paygold_username}&password=${paygold_pass}&meter_number=${meter_number}&phone=${phone}&variation_id=${variation}&service_id=${service}&amount=${amount}`

    const data = await fetchApi(url)
    if (data !== false){
        /**
         *
         * {"code":"success","message":"Electricity bill successfully paid","data":{"electricity":"Ikeja (IKEDC)","meter_number":"62418234034","token":"Token: 5345 8765 3456 3456 1232","phone":"07045461790","amount":"NGN8000","amount_charged":"NGN7920","request_id":"4251595499876226"}} 
        */
        return data
    }else{
        return false
    }
}

exports.buyCable = async({phone, service, smartcard_number, variation}) => {
    var url = `${paygold_url}tv?username=${paygold_username}&password=${paygold_pass}&phone=${phone}&service_id=${service}&smartcard_number=${smartcard_number}&variation_id=${variation}`;

    const data = await fetchApi(url)
    if (data !== false){
        /**
         *
         * {"code":"success","message":"Electricity bill successfully paid","data":{"electricity":"Ikeja (IKEDC)","meter_number":"62418234034","token":"Token: 5345 8765 3456 3456 1232","phone":"07045461790","amount":"NGN8000","amount_charged":"NGN7920","request_id":"4251595499876226"}} 
        */
        return data
    }else{
        return false
    }
}
// this.buyAirtimeData({phone: "07068006837", network: "mtn", amount: "100", type: "airtime", trans_id: "FTH-BILLs-09898766"})
// this.buyLight({phone: "07068006837", service: "ibadan-electric", amount: "500", variation: "prepaid", meter_number: "7867766660"})

// this.getBalance()
