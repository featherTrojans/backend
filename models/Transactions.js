const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Transactions = db_con.define("transactions", {
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
    "initialBal": {
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
    "finalBal": {
        allowNull: false,
        type: Sequelize.STRING,
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
    "from": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "funding",
        validate : {
           notEmpty: true
        }

    },
    "to": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "primary wallet",
        validate : {
           notEmpty: true
        }

    },
    "direction": {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: "in",
        validate: {
           notEmpty: true
        }
    },
    
})

module.exports = Transactions