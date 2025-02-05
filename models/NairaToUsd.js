const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const NairaToUsd = db_con.define("usdRates", {
    
    "rate": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "buyingRate": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "staff": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "AUTOMATED",
        validate : {
           notEmpty: true
        }
    },
    
    
})

module.exports = NairaToUsd