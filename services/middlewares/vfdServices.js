const {
    logger,
    vfdTestKey,
    vfdWalletCreden,
    vfdUrl,
    eventEmitter,
    environment
} = require('../../config/').config

const {Users, CollectionAccounts, BVN} = require('../../models')

const fetch = require('node-fetch');

const codeGenerator = require('../generateCode')
require('../../subscribers')

const fetchApiGet = async (params) => {
    try {
        let data =  await fetch(params.url, {
            headers: {
                AccessToken: `${params.key}`,
                "Content-Type": "application/json"
            }
        })
         response = await data.json()
        logger.info(response)
        if (response.status == '00') {
            console.log("response", response)
            return response.data
        } else {
            console.log("response", response)
            return false;
        }
    }catch (err) {
        logger.info(err);
        return false
    }
}
const fetchApi = async (params) => {
    try{
        let data =  await fetch(params.url, {
            headers: {
                AccessToken: `${params.key}`,
                "Content-Type": "application/json"
            }
        })
         response = await data.json()
        logger.info(response)
        if (response.status == '00') {
            // logger.info(data)
            // console.log(params)
            const {fullName} = await Users.findOne({
                where: {userUid: params.userId},
                attributes: ['fullName']
            })
            const nameGotten = ((response.data.lastName + "" + response.data.firstName).toLowerCase()).replace(/\s+/g, " ").trim();


            let firstname = (response.data.firstName).trim()
            let middlename = (response.data.middleName).trim() ?? null
            let lastname = (response.data.lastName).trim()
            let bvn = params.bvn
            let phone = response.data.phoneNo
            let dob = response.data.dateOfBirth
            let gender = response.data.gender


            // if ( (((fullName.toLowerCase()).replace(/\s+/g, " ").trim()) == nameGotten) || phone == params.phoneNumber) {
            Users.update({dateOfBirth: response.data.dateOfBirth}, {where: {userUid: params.userId}})
            let codeToSend = codeGenerator(6);
            BVN.create({
                userUid: params.userId,
                firstname,
                middlename,
                lastname,
                bvn,
                phoneNumber: phone,
                dateOfBirth: dob,
                gender,
                codeToSend
            })
            // this.createAccount({bvn, dob, userId: params.userId, firstname, middlename, lastname, phone, gender })
            this.createAccount({bvn, dob, userId: params.userId})

            //send verification code 

            phoneNumber = environment == 'live' ? phone : params.phoneNumber;
            message = `Hi Padi, your verification code to ugrade your account to Odogwu level is: ${codeToSend}. Valid for 30 minutes, one-time use only. DO NOT DISCLOSE TO ANYONE`;
            const sendCode = await eventEmitter.emit('sendMessage', {
                phoneNumber, message
            })
            console.log(sendCode)
            if (sendCode) {
                return true;
            } else {
                console.log(sendCode)
                return false;
            }

        } else {
            // logger.info(data)
            return false
        }
    } catch (err) {
        logger.info(err);
        return false
    }

}

const fetchApiPostP = async (data) => {
    try{
        console.log(data.url)
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      AccessToken: `${data.key}`,
                      "Content-Type": "application/json"
                    }
            ,body: JSON.stringify(data.body)
        })
        response = await response.json()
        console.log(data.body)
        //  logger.info(response);
        console.log('response', response)
        if (response.status == '00' || response.status == "01") {
            logger.info(response)
        } else {
            return false
        }
    } catch (err) {
        logger.info(err);
        return false
    }
}
const fetchApiPost = async (data) => {
    try{
        // console.log(data.url)
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      AccessToken: `${data.key}`,
                      "Content-Type": "application/json"
                    }
            ,body: JSON.stringify(data.body)
        })
        response = await response.json()

        // console.log(data.body)
        //  logger.info(response);
        console.log('response', response)
        if (response.status == '00' ) {
            logger.info(response)
            let check = await Users.findOne({
                where: {accountNo: response.data.accountNo}
            })
            logger.info('check', check);
            if (check == null) {
                Users.update({accountNo: response.data.accountNo, dateOfBirth: response.data.dob}, {where: {userUid: data.userId}})

                let insert = await CollectionAccounts.create({
                    userUid: data.userId,
                    firstname: response.data.firstname,
                    middlename: response.data?.middlename && (response.data.middlename).length > 1 ? response.data.middlename : null,
                    lastname: response.data.lastname,
                    bvn: response.data.bvn,
                    phone: response.data.phone,
                    dob: response.data.dob,
                    accountNo: response.data.accountNo
                })
                //log bvn data
                BVN.create({
                    userUid: data.userId,
                    firstname: response.data.firstname,
                    middlename: response.data?.middlename && (response.data.middlename).length > 1 ? response.data.middlename : null,
                    lastname: response.data.lastname,
                    bvn: response.data.bvn,
                    phoneNumber: response.data.phone,
                    dateOfBirth: response.data.dob,
                    gender: null,
                    codeToSend: null
                })
               var consentUrl = await this.bvnConsent({bvn: data.body.bvn})
                return ({status: true, url: consentUrl})
            } else {
                var consentUrl = await this.bvnConsent({bvn: data.body.bvn})
                return ({status: true, url: consentUrl})
            }
                
        } else if (response.status == '01') {
            let check = await Users.findOne({
                where: {accountNo: response.data.accountNo}
            })

            if (check == null) {
                Users.update({accountNo: response.data.accountNo, dateOfBirth: data.dob}, {where: {userUid: data.userId}})

                let insert = await CollectionAccounts.create({
                    userUid: data.userId,
                    firstname: data.body.firstname,
                    middlename: null,
                    lastname: data.body.lastname,
                    bvn: data.body.bvn,
                    phone: data.body.phone,
                    dob: data.body.dob,
                    accountNo: response.data.accountNo
                })
                //log bvn data
                BVN.create({
                    userUid: data.userId,
                    firstname: 'Feather-' + data.body.firstname,
                    middlename: null,
                    lastname: data.body.lastname,
                    bvn: data.body.bvn,
                    phoneNumber: data.body.phone,
                    dateOfBirth: data.body.dob,
                    gender: null,
                    codeToSend: null
                })
               let consentUrl = await this.bvnConsent({bvn: data.body.bvn})
                return ({status: true, url: consentUrl})
            }
        } else {  
            var consentUrl = await this.bvnConsent({bvn: data.body.bvn})
            return ({status: true, url: consentUrl})
        }
    } catch (err) {
        logger.info(err);
        return {status: false}
    }

}


exports.createAccount = async(data) => {

    const body = {
        "wallet-credentials": vfdWalletCreden,
    }
    let bodyToSend = {
        "bvn": data.bvn,
        "dob": data.dob,
        "firstname": data.firstname,
        "lastname": data.lastname,
        "phone": data.phone
    }
    console.log('vfdWalletCreden', vfdWalletCreden) 
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    // console.log(queryString)
    const url = vfdUrl + `wallet2/client/individual` 
    //?${queryString}`
    const res = await fetchApiPost({url, key: vfdTestKey, userId: data.userId, body: bodyToSend})
    return res
}

exports.queryBvn = async(data) => {

    const body = {
        "bvn": data.bvn,
        "wallet-credentials": vfdWalletCreden,
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    const url = vfdUrl + `wallet2/client` //?${queryString}`
    console.log(url)
    const res = await fetchApi({url, key: vfdTestKey, userId: data.userId, bvn: data.bvn, phoneNumber: data.phoneNumber})
    console.log(res)
    return res

}

exports.bvnConsent = async(data) => {

    const body = {
        "bvn": data.bvn,
        "wallet-credentials": vfdWalletCreden,
        "type": "02"
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    const url = vfdUrl + `wallet2/bvn-consent?${queryString}`
    console.log(url)
    const res = await fetchApiGet({url, key: vfdTestKey})
    console.log(res?.url)
    return res?.url ?? "https://services.vfdtech.ng/"

}


exports.releaseAccount = async(data) => {

    const body = {
        "wallet-credentials": vfdWalletCreden,
    }
    let bodyToSend = {
        "accountNo": data.accountNo
    }

    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    // console.log(queryString)
    const url = vfdUrl + `wallet2/client/release` //?${queryString}`
    const res = await fetchApiPostP({url, key: vfdTestKey, body: bodyToSend})
    return res
}


// this.createAccount({bvn: "1111111133", dob: "04 October 1960", userId: "aw08HmcKBP", firstname: "Goodluck", lastname: "Jonatham", phone: "08135542261" }) 

// this.queryBvn({bvn: "22222222223", userId: "aw08HmcKBP" })
// this.bvnConsent({bvn: "2222222225"})

// this.releaseAccount({accountNo: "1001456721"})
