const {
    paygold_pass,
    paygold_url, 
    paygold_username,
    logger
} = require('../../config/').config

const fetch = require('node-fetch');


const fetchApi = async (url) => {
    try{
        let data =  await fetch(url)
         data = await data.json()
        if (data.code == 'success') {
            logger.info(data)
            return data.data
        } else {
            logger.info(data)
            return false
        }
    } catch (err) {
        logger.info(err);
        return false
    }

}
exports.getBalance = async () => {
    var url = `${paygold_url}balance?username=${paygold_username}&password=${paygold_pass}`

    const data = await fetchApi(url)
    if (data !== false){
        return data.balance
    }else{
        return false
    }
    
}

exports.buyAirtimeData = async ({phone, network, amount, type}) =>{

    if (type == 'airtime') {
        //buy airtime for user
        var url = `${paygold_url}airtime?username=${paygold_username}&password=${paygold_pass}&network_id=${network}&phone=${phone}&amount=${amount}`

        const data = await fetchApi(url)
        if (data !== false){
            /**
             * {
                network: 'MTN',
                phone: '07068006837',
                amount: 'NGN50',
                request_id: '414111443093821647116925632'
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

exports.buyLight = ({service, amount, meter_number, variation, phone}) => {

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
// this.buyAirtimeData({phone: "07068006837", network: "mtn", amount: "GIFT500", type: "data"})
// this.buyLight({phone: "07068006837", service: "ibadan-electric", amount: "500", variation: "prepaid", meter_number: "7867766660"})

// this.getBalance()
