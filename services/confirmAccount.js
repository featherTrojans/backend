const { BankAccount } = require("../models");


const confirmAccount = async (data) => {

    return await BankAccount.findOne({attributes: ['account_number', 'account_name', 'bank_name', 'is_beneficiary'], where: {account_number: data.account_number}});
    
}

module.exports = confirmAccount