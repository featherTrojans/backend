const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const NewBills = db_con.define("n_bills", {
    
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "amount": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "amountDeducted": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '0',
        validate : {
           notEmpty: true
        }
    },
    "amountGained": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '0',
        validate : {
           notEmpty: true
        }
    },
    "balance": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '0',
        validate : {
           notEmpty: true
        }
    },
    "reference": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "network": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "transId": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }
    },
    "description": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "status": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "PROCESSING",
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = NewBills