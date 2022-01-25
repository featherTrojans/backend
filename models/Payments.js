const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Payments = db_con.define("payments", {

    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },

    "transId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "authorizationUrl": {
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
    "accessCode": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "isUsed": {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        validate : {
           notEmpty: true
        }

    },
        
})

module.exports = Payments