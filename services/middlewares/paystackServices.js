let PayStack = require('paystack-node');
const { config } = require('../../config');

const { BankAccount, Withdrawal, Users, BVN, Transactions } = require('../../models');
const {logger, paystack_secret_key, environment, Op} = config
const fetch = require('node-fetch');


let APIKEY = paystack_secret_key;

const paystack = new PayStack(APIKEY, environment)

exports.sortCode = (bank) => {                               //for making payments into bank accounts, Bank Sort Code is needed. Pass in the bank e.g. GTB, FIRST, etc
    //https://api.paystack.co/bank
    if(bank == 'GTB'){bank_code = '058';}else if(bank == 'FIRST'){bank_code = '011';}else   if(bank == 'ZENITH'){bank_code = '057';}else  if(bank == 'ACCESS'){bank_code = '044';}else
    if(bank == 'STANBIC'){bank_code = '221';}else if(bank == 'DIAMOND'){bank_code = '063';}else   if(bank == 'SKYE'){bank_code = '076';}else   if(bank == 'WEMA'){bank_code = '035';}else
    if(bank == 'FCMB'){bank_code = '214';}else if(bank == 'FIDELITY'){bank_code = '070';}else   if(bank == 'UBA'){bank_code = '033';}else   if(bank == 'UNION'){bank_code = '032';}
    if(bank == 'ECOBANK'){bank_code = '050';}else if(bank == 'HERITAGE'){bank_code = '030';}else   if(bank == 'UNITY'){bank_code = '215';}else   if(bank == 'STERLING'){bank_code = '232';}
    if(bank == 'JAIZ'){bank_code = '301';}else if(bank == 'KEYSTONE'){bank_code = '082';}else if (bank == 'KUDA') {bank_code = '50211';} else if (bank == 'POLARIS') { bank_code = '076'; }
    else if (bank == 'PAYCOM') {bank_code = '999992';} else if (bank == 'PROVIDUS') { bank_code = '101';} else if (bank == 'TAJ') { bank_code = '302';} else if (bank == 'VFD') { bank_code = '566';}
    
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
            amount: (payload.amount * 100),
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
                  charges: payload.charges,
                  transfer_code: data.transfer_code,
                  reference: payload.reference
              })
              return data;
          }
    }catch(ex){
        logger.info(ex.message)
        return false;
    }

        
}


exports.resolveBvn = async (payload) => {
    try {
        
          let body = JSON.stringify({

            account_number: payload.acc_num, 
            bank_code: this.sortCode(payload.bank_name),
            bvn: payload.bvn,
            first_name: payload.first_name,
	        last_name: payload.last_name,
            middle_name: payload.middle_name?? null
          })

          let response =  await fetch("https://api.paystack.co/bvn/match", {
            method: 'POST',
            headers: {Authorization: `Bearer ${APIKEY}`,
                      "Content-Type": "application/json"
                    },
            body
        })


        response = await response.json()
        //  logger.info(response);
        if (response.message == 'success' && response.status != false) {
            logger.info(response)
            //create bvn table
            const create = await BVN.create({
                userUid: payload.userId,
                bvn: payload.bvn,
                acc_num: payload.acc_num,
                bank_name: payload.bank_name       
            })

            if (create) {
                Users.update({userLevel: 2, dateOfBirth: dob}, {where: {userUid: payload.userId}})
                //generate unique account
                createCollectionAccount({bvn: payload.bvn, dob: payload.dob, userId: payload.userId })
                return true
            } else {
                return false
            }

        } else {
            console.log('response : ')
            logger.info(response)
            return false
        }
    }catch(ex){
        logger.info(ex.message)
        console.log('erroror', ex)
        return false;
    }

        
}

exports.queryWithdrawals = async () => {
    //search withdrawals in the last 10 minutes
    let transactions = await Transactions.findAll({
        where: {description:
            {[Op.endsWith]: 'withdrawal'},
            // description: {[Op.substring]: '%withdrawal reversal%'},
            },
        order: [['updatedAt', 'DESC']],
        limit: 50
    })

    if ( transactions.length > 0 ) {
        // logger.info(allStatuses)
        for (const [key, value] of Object.entries(transactions)){
            // console.log(value.reference);
            // check reference in withdrawal table
            check = await Withdrawal.findOne({
                where: {reference: value.reference},
                
            })

            // logger.info(check)
            query = await fetch(`https://api.paystack.co/transaction/verify/${value.reference}`, {
                // method: 'GET',
                headers: {Authorization: `Bearer ${APIKEY}`,
                          "Content-Type": "application/json"
                        },
                // body
            })
            if (check === null ) {
                //refund user
            } else {
                //query withdrawal
            }
            console.log(query)
        }
    }

    
}

// this.resolveBvn({bvn: '22222222223', bank_name: "FIRST", acc_num: "3063857057", first_name: 'Ezekiel', last_name: "Adejobi", userId})
this.queryWithdrawals()
