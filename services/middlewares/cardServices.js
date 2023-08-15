const { config } = require('../../config');
const cron = require('node-cron');
const {logger, bc_url, bc_akey, bc_skey, environment} = config
const fetchApi = require('node-fetch');
const { Card } = require('../../models');


exports.createHolder = async (data) => {

  try {
    /**
     * id_type can be NIGERIAN_NIN or "NIGERIAN_INTERNATIONAL_PASSPORT" or "NIGERIAN_PVC" or "NIGERIAN_DRIVERS_LICENSE"
     */
    var options = {
        method: 'POST',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cardholder/register_cardholder_synchronously`, options);
    console.log(options)
    console.log('response', response)
    let status = response.status
    response = await response.json()
    console.log('request: ', response)
    if (status == 201 ) {
      //create card
      cardholder_id = response.data.cardholder_id

      await Card.create({
        userUid: data.userUid,
        cardholder_id,

      })
       this.createCard(
        {
            "cardholder_id": cardholder_id,
            "card_type": "virtual",
            "card_brand": "Visa2",
            "card_currency": "USD",
          }
      )
      
    } else {
      return ({statusCode: 400, other: {
        status: false,
        data: {},
        message: response.message
      }})
    }
  } catch (e){
    console.log('error', e)
    return ({statusCode: 400, other: {
      status: false,
      data: {},
      message: "An error occured, try again later"    }})
  }
}

exports.createCard = async (data) => {

  try {

    var options = {
        method: 'POST',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/create_card`, options);
    // console.log(options)
    console.log('response status CC', response.status)
    let status = response.status
    response = await response.json()
    // {
    //   status: 'success',
    //   message: 'The Visa USD card was created successfully',
    //   data: { card_id: '9527494538bc49199b146db44a4e8692', currency: 'USD' }
    // }
    console.log('card create request: ', response)
    if (status == 201 ) {
      card_id = response.data.card_id;

      Card.update({card_id}, {where: {
        cardholder_id: data.cardholder_id
      }})

      return ({statusCode: 201, other: {
        status: true,
        data: {},
        message: response.message
      }})
    } else {
      return ({statusCode: 400, other: {
        status: false,
        data: {},
        message: response.message
      }})
    }
  } catch (e){
    console.log('error', e)
    return ({statusCode: 400, other: {
      status: false,
      data: {},
      message: "An error occured, try again later"    }})
  }
}

exports.getCardDetails = async (data) => {

  try {

    var options = {
        method: 'GET',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        }
    };
    url = environment == "live" ?  `https://issuecards-api-bridgecard-co.relay.evervault.com/v1/issuing/cards/get_card_details?card_id=${data.card_id}` : `https://issuecards-api-bridgecard-co.relay.evervault.com/v1/issuing/sandbox/cards/get_card_details?card_id=${data.card_id}`
    
    let response = await fetchApi(url, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success'){
      return ({
        statusCode: 200,
        other: {status: true, data: response.data, message: "Successfully retrieved"}
      })
    } else{
      return {
        statusCode: 404,
        other: {status: false, data: response.data, message: "Card does not exist"}
      }
    }
  } catch (e){
    console.log('error', e)
  }
}

exports.getCardBalance = async (data) => {

  try {

    var options = {
        method: 'GET',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        }
    };

    let response = await fetchApi(`${bc_url}/cards/get_card_balance?card_id=${data.card_id}`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success'){
      return response.data.balance
    } else{
      return false
    }

  } catch (e){
    console.log('error', e)
  }
}


exports.fundCard = async (data) => {

  try {

    var options = {
        method: 'PATCH',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/fund_card`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success'){
      return response.data
    } else {
      return false
    }
  } catch (e){
    console.log('error', e)
  }
}

exports.unloadCard = async (data) => {

  try {

    var options = {
        method: 'PATCH',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/unload_card`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success') {
      return response.data
    } else {
      return false
    }
  } catch (e){
    console.log('error', e)
  }
}

exports.freezeCard = async (data) => {

  try {

    var options = {
        method: 'PATCH',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/freeze_card?card_id=${data.card_id}`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success') {
      return response.data
    } else {
      return false
    }
  } catch (e){
    console.log('error', e)
  }
}

exports.unfreezeCard = async (data) => {

  try {

    var options = {
        method: 'PATCH',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/unfreeze_card?card_id=${data.card_id}`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success') {
      return response.data
    } else {
      return false
    }
  } catch (e){
    console.log('error', e)
  }
}
exports.fundIssuingWallet = async (data) => {

  try {

    var options = {
        method: 'PATCH',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        },

        body: 
            JSON.stringify(data)
    };

    let response = await fetchApi(`${bc_url}/cards/fund_issuing_wallet`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
  } catch (e){
    console.log('error', e)
  }
}

exports.getFxRate = async () => {

  try {

    var options = {
        method: 'GET',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        }
    };

    let response = await fetchApi(`${bc_url}/cards/fx-rate`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response)
    if (response.status == 'success'){
      return response.data.balance
    } else{
      return false
    }

  } catch (e){
    console.log('error', e)
  }
}

exports.getCardTrans = async (data) => {

  try {

    var options = {
        method: 'GET',
        headers : {
          token: `Bearer ${bc_akey}`,
          'Content-Type': 'application/json'
        }
    };

    let response = await fetchApi(`${bc_url}/cards/get_card_transactions?card_id=${data.card_id}`, options);
    // console.log(options)
    // console.log('response', response)
    response = await response.json()
    console.log('request: ', response.data)
    if (response.status == 'success'){
      return response.data.balance
    } else{
      return false
    }

  } catch (e){
    console.log('error', e)
  }
}

// this.getFxRate()
// this.unfreezeCard({card_id: "9527494538bc49199b146db44a4e8692"})
// this.getCardDetails({card_id: "9527494538bc49199b146db44a4e8692"})
// this.getCardBalance({card_id: "9527494538bc49199b146db44a4e8692"})
// this.getCardTrans({card_id: "9527494538bc49199b146db44a4e8692"})

// this.createCard({
//   "cardholder_id": "26ddb2dd67c247489c3be803b0119345",
//   "card_type": "virtual",
//   "card_brand": "Visa2",
//   "card_currency": "USD",
//   // "meta_data": {
//   //   "user_id": "d0658fedf828420786e4a7083fa"
//   // }
// })
// this.createHolder({
//   "userUid": "FGT3gCUuoy",
//   "first_name": "John",
//   "last_name": "Doe",
//   "address": {
//     "address": "9 Jibowu Street",
//     "city": "Aba North",
//     "state": "Abia",
//     "country": "Nigeria",
//     "postal_code": "1000242",
//     "house_no": "13"
//   },
//   "phone": "08122262238",
//   "email_address": "testingboy@gmail.com",
//   "identity": {
//     "id_type": "NIGERIAN_NIN",
//     "id_no": "1011192211",
//     "id_image": "https://res.cloudinary.com/ezeko/image/upload/v1682000186/feather/7068006837_idpic.png",
//     "bvn": "22221784523"
//   }
// })

// this.fundCard({
//   "card_id": "9527494538bc49199b146db44a4e8692",
//   "amount": "100",
//   "transaction_reference": "216ef11a58bf468baeb9cdbb94765865",
//   "currency": "USD"
// })
// this.unloadCard({
//   "card_id": "9527494538bc49199b146db44a4e8692",
//   "amount": "10",
//   "transaction_reference": "216ef11a58bf468baeb9cdbb97765865",
//   "currency": "USD"
// })

// this.fundIssuingWallet({
//   "amount": "100000"
// })