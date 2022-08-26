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


const fetchApi = async (params) => {
    try{
        let data =  await fetch(params.url, {
            headers: {
                Authorization: `Bearer ${params.key}`,
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
            message = `Hi Padi, your verification code to ugrade your account to Odogwu level is: ${codeToSend}. DO NOT DISCLOSE TO ANYONE`;
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


const fetchApiPost = async (data) => {
    try{
        console.log(data.url)
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      Authorization: `Bearer ${data.key}`,
                      "Content-Type": "application/json"
                    }
            // ,body: data.body
        })
        response = await response.json()
        //  logger.info(response);
        console.log('response', response)
        if (response.status == '00') {
            logger.info(response)
                Users.update({accountNo: response.data.accountNo}, {where: {userUid: data.userId}})
                await CollectionAccounts.create({
                    userUid: data.userId,
                    firstname: response.data.firstname,
                    middlename: response.data.middlename ?? null,
                    lastname: response.data.lastname,
                    bvn: response.data.bvn,
                    phone: response.data.phone,
                    dob: response.data.dob,
                    accountNo: response.data.accountNo
                })
            

            return true
        } else {
            logger.info(response)
            return response.message
        }
    } catch (err) {
        logger.info(err);
        return false
    }

}


exports.createAccount = async(data) => {

    // const body = {
    //     "wallet-credentials": vfdWalletCreden,
    //     "bvn": data.bvn,
    //     "phone": data.phone,
    //     "firstname": data.firstname,
    //     "lastname": data.lastname,
    //     "middlename": data.middlename,
    //     "gender": data.gender,
    //     "dob": `${data.dob}`,
    // }
    const body = {
        "wallet-credentials": vfdWalletCreden,
        "bvn": data.bvn,
        "dateOfBirth": data.dob
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    // console.log(queryString)
    const url = vfdUrl + `/wallet2/client/create?${queryString}`
    const res = await fetchApiPost({url, key: vfdTestKey, userId: data.userId})
    return res
}

exports.queryBvn = async(data) => {

    const body = {
        "bvn": data.bvn,
        "wallet-credentials": vfdWalletCreden,
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    const url = vfdUrl + `/wallet2/client?${queryString}`
    // console.log(url)
    const res = await fetchApi({url, key: vfdTestKey, userId: data.userId, bvn: data.bvn, phoneNumber: data.phoneNumber})
    return res
}


// this.createAccount({bvn: "22222222223", dob: "05-Apr-1994", userId: "aw08HmcKBP" })

// this.queryBvn({bvn: "22222222223", userId: "aw08HmcKBP" })
