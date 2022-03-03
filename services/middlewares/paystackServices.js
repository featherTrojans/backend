let PayStack = require('paystack-node');
const { config } = require('../../config');
const { BankAccount, Withdrawal } = require('../../models');
const logger = config.logger

let APIKEY = config.paystack_secret_key;
const environment = config.environment;

const paystack = new PayStack(APIKEY, environment)

exports.sortCode = (bank) => {                               //for making payments into bank accounts, Bank Sort Code is needed. Pass in the bank e.g. GTB, FIRST, etc
    if(bank == 'GTB'){bank_code = '058';}else if(bank == 'FIRST'){bank_code = '011';}else   if(bank == 'ZENITH'){bank_code = '057';}else  if(bank == 'ACCESS'){bank_code = '044';}else
    if(bank == 'STANBIC'){bank_code = '221';}else if(bank == 'DIAMOND'){bank_code = '063';}else   if(bank == 'SKYE'){bank_code = '076';}else   if(bank == 'WEMA'){bank_code = '035';}else
    if(bank == 'FCMB'){bank_code = '214';}else if(bank == 'FIDELITY'){bank_code = '070';}else   if(bank == 'UBA'){bank_code = '033';}else   if(bank == 'UNION'){bank_code = '032';}
    if(bank == 'ECOBANK'){bank_code = '050';}else if(bank == 'HERITAGE'){bank_code = '030';}else   if(bank == 'UNITY'){bank_code = '215';}else   if(bank == 'STERLING'){bank_code = '232';}
    if(bank == 'JAIZ'){bank_code = '301';}else if(bank == 'KEYSTONE'){bank_code = '082';}else if (bank == 'KUDA') {bank_code = '50211';} else if (bank == 'POLARIS') { bank_code = '076'; }
    else if (bank == 'PAYCOM') {bank_code = '999992';} else if (bank == 'PROVIDUS') { bank_code = '101';} else if (bank == 'TAJ') { bank_code = '302';}
    
    return bank_code;           
}
exports.feeCalculator = async (amount) => {
    try {
        const feesCalculator = new PayStack.Fees();
        const feeCharge = await feesCalculator.calculateFor(amount) // 2,500 Naira
        logger.info(`feeCharge ${ typeof String(feeCharge)}`);
        return String(feeCharge)

    } catch(ex){

        logger.info(ex.message)

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
        logger.info(ex.message)

        return false;
      }
}


exports.initializeTransaction = async (payload) => {
    try {
        let { body: { status, message, data } } =  await paystack.initializeTransaction({
            reference: payload.reference,
            amount: payload.amount, // 5,000 Naira (remember you have to pass amount in kobo)
            email: payload.email,
        })
        
          if(status === false){
              logger.info(message)
              return false;
          }else{
              return data;
          }
    }catch(ex){
        logger.info(ex.message)

        return false;
    }

        
}

exports.verifyTransaction = async (payload) => {
    try {
        let { body: { status, message, data } } =  await paystack.verifyTransaction({
            reference: payload.reference
          })
        
          if(status === false){
              logger.info(message)
              return false;
          }else{
              return data;
          }
    }catch(ex){
        logger.info(ex.message)
        return false;
    }

        
}


exports.addAccount = async (payload) => {
    try {
        const {account_name} = await this.resolveAccount({acc_num: payload.account_number, bank_name: payload.bank_name})
        let { body: { status, message, data } } =  await paystack.createTransferRecipient({
            type: "nuban",
            name: account_name,
            account_number: payload.account_number,
            bank_code: this.sortCode(payload.bank_name),
            currency: "NGN"
          })
        
          if(status === false){
              logger.info(message)
              return false;
          }else{
              // insert into db
              await BankAccount.create({
                  user_uid: payload.user_uid,
                  account_code: data.recipient_code,
                  account_number: payload.account_number,
                  account_name,
                  bank_name: data.details.bank_name
              })

              return {
                account_code: data.recipient_code,
                account_number: payload.account_number,
                account_name,
                bank_name: data.details.bank_name,
                is_beneficiary: false
            };
          }
    }catch(ex){
        logger.info(ex.message)
        return false;
    }

        
}


exports.resolveAccount = async (payload) => {
    try {
        
        let { body: { status, message, data } } = await paystack.resolveAccountNumber({

            account_number: payload.acc_num, 
            bank_code: this.sortCode(payload.bank_name)
          })
        
          if(status === false){
              logger.info(message)
              return false;
          }else{
              return data;
          }
    }catch(ex){
        logger.info(ex.message)

        return false;
    }

        
}



exports.withdrawFund = async (payload) => {
    try {

        let { body: { status, message, data } } =  await paystack.initiateTransfer({

            source: "balance",
            reason: payload.narration,
            amount: payload.amount,
            recipient: payload.account_code,
            reference: payload.reference

          })
        
          if(status == false){
              logger.info(message)
              return false;
          }else{
              // insert into db
              logger.info(data)
              await Withdrawal.create({
                  user_uid: payload.user_uid,
                  account_code: payload.account_code,
                  account_name: payload.account_name,
                  account_number: payload.account_number,
                  amount: payload.amount,
                  reference: payload.reference,
                  bank_name: payload.bank_name,
                  charges: 50,
                  transfer_code: data.transfer_code
              })
              return data;
          }
    }catch(ex){
        logger.info(ex.message)
        return false;
    }

        
}

