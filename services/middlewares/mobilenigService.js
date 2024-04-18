const {
    logger,
    mobilenig_pk_key,
    mobilenig_sk_key,
    mobilenig_url,
    environment
} = require('../../config/').config

const fetch = require('node-fetch');
const { NewBills, DoubleSpent } = require('../../models')
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
    switch (network.toLowerCase()) {
        case "mtn": return 'BAD';
        case "glo": return "BAB";
        case "airtel": return "BAA";
        case "9mobile": return "BAC";
        case "eko-electric": return "ANA";
        case "ibadan-electric": return "AEA";
        case "abuja-electric": return "AHB";
        case "kaduna-electric": return "AGB";
        case "kano-electric": return "AFA";
        case "portharcout-electric": return "ADB";
        case "jos-electric": return "ACB";
        case "mtn-data": return "BCA";
        case "glo-data": return "BCC";
        case "9mobile-data": return "BCB";
        case "airtel-data": return "BCD";
        case "gotv": return "AKA";
        case "dstv": return "AKC";
        case "startimes": return "AKB";
        case "showmax": return "SMA";
        case "smile": return "ALA";
        case "waec": return "AJA";
        case "neco": return "AJC";
        case "jamb": return "AJB";
        case "spectranet": return "ALB";
        default: return false
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
        console.log("body", data.body)

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


const getDetails = async (data) => {
    var url = `${mobilenig_url}services/proxy`
    const body = JSON.stringify({
        "service_id": getServiceId(data.service),
        customerAccountId: data.meter_number
    })
    const details = await fetchApiPost({url, key: mobilenig_pk_key, body})
    console.log('data 1', details)
    if (data !== false && details != null){
        return details
    }else{
        return false
    }
}


exports.getBalance = async () => {
    var url = `${mobilenig_url
    }control/balance`

    const data = await fetchApiPost({url, key: mobilenig_pk_key})
    logger.info(data);
    if (data !== false){
        return data.message == 'success' && data.statusCode == 200 ? data.details.balance : 0
    }else{
        return 0;
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

        //buy airtime for user
        var url = `${mobilenig_url}services/`
        const body = JSON.stringify({
            "service_id": getServiceId(network),
            trans_id,
            "service_type": "PREMIUM",
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
   
}

exports.buyData = async ({phone, network, amount, value, trans_id}) => {
    var url = `${mobilenig_url}services/`
        let service_id = getServiceId(network + "-data")
        let codeRes = await this.getCode({service_id, value, charge: amount})
        console.log(codeRes)
        if (codeRes.status !== false ) {
            console.log('code: ', codeRes.data.code )
            let {code , price} = codeRes.data
            const body = JSON.stringify({
                service_id,
                trans_id,
                "service_type": "SME",
                "beneficiary": phone,
                amount: price,
                code
            })
            const data = await fetchApiPost({url, key: mobilenig_sk_key, body})
        if (data !== false){
            /**
             * 
             * {
                    message: 'success',
                    statusCode: '202',
                    details: 'Your request status is pending, kindly use the query request after two minutes to get the final status.'
                }
             */
            return data
        }else{
            return false
        }
        } else {
            return false
        }
        
}

exports.buyLight = async({service, amount, meter_number, trans_id}) => {

    const details = await getDetails({service, meter_number})
    console.log(details);

    if (details ) {
        const {customerNumber, meterNumber, customerAccountType, customerDistrict, customerAddress, customerName, accountNumber,  customerDtNumber } = details
        var url = `${mobilenig_url}services/`
        const body = JSON.stringify({
            "service_id": getServiceId(service),
            trans_id,
            meterNumber,
            customerDistrict,
            customerAddress,
            customerName,
            amount,
            accountNumber,
            customerDtNumber,
            customerNumber,
            customerAccountType,
            customerReference: meterNumber,
        })
        const data = await fetchApiPost({url, key: mobilenig_sk_key, body})
        console.log('data', data)
        if (data !== false){
            return data

        }else{
            return false
        }
    } else {
        return false
    }
}

exports.buyCable = async({trans_id, phone, service, smartcard_number, productCode, amount, customerName}) => {
    var url = `${mobilenig_url}services/`;
    const body = service.toLowerCase() == 'waec' || service.toLowerCase() == 'neco' ? JSON.stringify({
        "service_id": getServiceId(service),
        trans_id,
        quantity: smartcard_number,
        amount,
        productCode
    }) 
        :
        JSON.stringify({
        "service_id": getServiceId(service),
        trans_id,
        smartcardNumber: smartcard_number,
        productCode,
        customerName,
        amount,
        customerNumber: phone,
    })
    const data = await fetchApiPost({url, key: mobilenig_sk_key, body})
    console.log('data', data)
    if (data !== false){
        /**
         *
         * {"code":"success","message":"Electricity bill successfully paid","data":{"electricity":"Ikeja (IKEDC)","meter_number":"62418234034","token":"Token: 5345 8765 3456 3456 1232","phone":"07045461790","amount":"NGN8000","amount_charged":"NGN7920","request_id":"4251595499876226"}} 
        */
         if (service.toLowerCase() == 'waec' || service.toLowerCase() == 'neco') {
            NewBills.update({
                status: "SUCCESS",
                description: JSON.stringify(data.details.pins),
                
            }, {where: {transId: trans_id}})
        }
        return data
    }else{
        return false
    }
}

exports.pricing = async({service_id, requestType}) => {

        var url = `${mobilenig_url}services/packages`
        const body = JSON.stringify({
            service_id,
            requestType
        })
        
        const data = await fetchApiPost({url, key: mobilenig_pk_key, body: body})
        // console.log('data', data)
        if (data !== false){
            return data
        }else{
            return false
        }
    
}

exports.getCablePrices = ( async(data) => {
    let service_id = getServiceId(data)
    let detail = await this.pricing({service_id, requestType: "SME"})
    let result = []

    if (detail == false) {
        return false;
    } else {
        console.log( typeof detail)
        return detail
        
    }
})

exports.getCableDetail = ( async(data) => {
    console.log(data.package)
    let {package, decoderNo} = data
    
    let detail = await getDetails({
        service: package,
        meter_number: decoderNo
    })

    if (detail == false) {
        return false;
    } else {

        return detail
        
        
    }
})

exports.getCode = ( async (data) => {
    let {service_id, value, charge} = data
    let details = await this.pricing({service_id, requestType :'SME'})
    let result = {status: false}
    details.forEach(element => {
        if ( service_id == 'BCA') {
            console.log("element: ", element)
        } else {
            dataToGB = value/1000
            dataToBuy = dataToGB >= 1 ? dataToGB + "GB" : value + "MB"
            if (element.name.includes(dataToBuy)) {
                if (charge > element.price) {
                    console.log("dataToBuy: ", element)
                    result = {
                        status: 'success',
                        data: {code: element.productCode, price: element.price}
                    }
                }

            }

        }

    });
    return result
})

exports.query_trans = async (trans_id) => {
    var url = `${mobilenig_url
    }services/query?trans_id=${trans_id}`

    let data = await fetch(url, {
        headers: {Authorization: `Bearer ${mobilenig_sk_key}`,
                    "Content-Type": "application/json"
                } 
    })

    data = await data.json()
    // logger.info(data)
    // console.log(typeof (data.details) == 'string')
    console.log(data)
    if (typeof (data.details) != null){ 
        console.log(data)
        return data
    }else{
        return false
    }

}
// this.buyAirtimeData({phone: "08012345678", network: "9mobile", amount: "300", type: "data", trans_id: "3vD3xcoCFey"})

// this.buyData({phone: "08012345678", network: "9mobile", amount: "300", type: "data", value: 500, trans_id: "3vD3xpoCiey"})
// this.buyLight({phone: "09023656565655", service: "eko-electric", amount: "500", variation: "prepaid", meter_number: "7867766660"})

// this.getBalance()

// this.query_trans('3vD3xcoCFew')
// this.pricing({service_id: 'AKA', requestType :'SME'})
// this.getCode({service_id: 'BCD', value: 1000, charge: 300})