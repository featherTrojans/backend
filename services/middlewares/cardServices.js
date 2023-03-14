const { config } = require('../../config');
const cron = require('node-cron');
const {logger, bc_url, bc_akey, bc_skey} = config
const fetch = require('node-fetch');


exports.createHolder = async () => {
    /**
     * id_type can be NIGERIAN_NIN or "NIGERIAN_INTERNATIONAL_PASSPORT" or "NIGERIAN_PVC" or "NIGERIAN_DRIVERS_LICENSE"
     */
    var options = {
        'method': 'POST',
        'headers': {
          'token': 'Bearer ' +  bc_akey,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(
            {
          "first_name": "John",
          "last_name": "Doe",
          "address": {
            "address": "9 Jibowu Street",
            "city": "Aba North",
            "state": "Abia",
            "country": "Nigeria",
            "postal_code": "1000242",
            "house_no": "13"
          },
          "phone": "08122277789",
          "email_address": "testingboy@gmail.com",
          "identity": {
            "id_type": "NIGERIAN_NIN",
            "id_no": "11111111111",
            "id_image": "",
            "bvn": "2222222222"
          },
          "meta_data":{"secret_key": bc_skey} 
        })
    };

    let response = await fetch(`${bc_url}/cardholder/register_cardholder_synchronously`, options);

    console.log('request: ', response)
      
}


// this.createHolder()