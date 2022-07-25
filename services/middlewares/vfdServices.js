const {
    logger,
    vfdTestKey,
    vfdWalletCreden,
    vfdUrl
} = require('../../config/').config

const {Users, CollectionAccounts, BVN} = require('../../models')

const fetch = require('node-fetch');


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
            console.log('fullName', fullName)
            if ( (fullName.toLowerCase()).replace(/\s+/g, " ") == ((response.data.lastName + "" + response.data.firstName).toLowerCase()).replace(/\s+/g, " ")) {
                Users.update({userLevel: 2, dateOfBirth: response.data.dateOfBirth}, {where: {userUid: params.userId}})
                BVN.create({
                    userUid: params.userId,
                    firstname: response.data.firstName,
                    middlename: response.data.middleName ?? null,
                    lastname: response.data.lastName,
                    bvn: params.bvn,
                    phoneNumber: response.data.phoneNo,
                    dateOfBirth: response.data.dateOfBirth,
                    gender: response.data.gender
                })
                this.createAccount({bvn: params.bvn, dob: response.data.dateOfBirth, userId: params.userId })
                return true;
            } else {
                console.log(fullName.toLowerCase() + " not tally with ", ((response.data.lastName + "" + response.data.firstName).toLowerCase()).replace(/\s+/g, " ") )
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
        let response =  await fetch(data.url, {
            method: 'POST',
            headers: {
                      Authorization: `Bearer ${data.key}`,
                      "Content-Type": "application/json"
                    }
            // ,body: data?.body ?? ''
        })
        response = await response.json()
        //  logger.info(response);
        // console.log('response', response)
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

    const body = {
        "wallet-credentials": vfdWalletCreden,
        "bvn": data.bvn,
        "dateOfBirth": data.dob
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
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
    const res = await fetchApi({url, key: vfdTestKey, userId: data.userId, bvn: data.bvn})
    return res
}


// this.createAccount({bvn: "22222222223", dob: "05-Apr-1994", userId: "aw08HmcKBP" })

// this.queryBvn({bvn: "22222222223", userId: "aw08HmcKBP" })
