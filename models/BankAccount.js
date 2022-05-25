const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const BankAccount = db_con.define("bank_accounts", {
    
    "user_uid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "account_code": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "account_number": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "account_name": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "bank_name": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "is_beneficiary": {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = BankAccount