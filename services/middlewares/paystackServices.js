let PayStack = require('paystack-node');
const { config } = require('../../config');
const logger = config.logger

let APIKEY = config.paystack_secret_key;
const environment = config.environment;

const paystack = new PayStack(APIKEY, environment)

exports.feeCalculator = async (amount) => {
    try {
        const feesCalculator = new PayStack.Fees();
        const feeCharge = feesCalculator.calculateFor(amount) // 2,500 Naira
        return feeCharge

    } catch(ex){

        logger.debug(ex.message)
        console.error(ex.message);
        return false;
        
    }

}

exports.listBanks = async () => {

    try {
        let { body: { status, message, data } } =  await paystack.listBanks({
          currency: 'NGN'
        });
      
        if(status === false){
            logger.info(message)
            return false;
        }else{
            return data;
        }
      }catch(ex){
        logger.debug(ex.message)
        console.error(ex.message);
        return false;
      }
}


exports.initializeTransaction = async () => {
    try {
        let { body: { status, message, data } } =  await paystack.initializeTransaction({
            reference: "7PVGX8MEk85tgeEpVDtD",
            amount: 500000, // 5,000 Naira (remember you have to pass amount in kobo)
            email: "seun045olayinka@gmail.com",
            Authorization: `Bearer ${APIKEY}`
        })
        
          if(status === false){
              logger.info(message)
              return false;
          }else{
              return data;
          }
    }catch(ex){
        logger.debug(ex.message)
        console.error(ex.message);
        return false;
    }

        
}

