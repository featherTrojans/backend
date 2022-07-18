const {
    logger,
    vfdTestKey,
    vfdWalletCreden,
    vfdUrl
} = require('../../config/').config

const fetch = require('node-fetch');


const fetchApi = async (params) => {
    try{
        let data =  await fetch(params.url, {
            headers: {Authorization: `Bearer ${params.key}`,
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


exports.createAccount = async() => {

    const body = {
        "wallet-credentials": vfdWalletCreden,
        "bvn": "2048767677",
        "dateOfBirth": "06-Apr-1994"
    }
    const queryString = Object.keys(body).map(key => key + '=' + body[key]).join('&');
    const url = vfdUrl + `/wallet2/client/create?${queryString}`
    const res = await fetchApiPost({url, key: vfdTestKey})
    console.log(res)
}




this.createAccount()
