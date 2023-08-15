const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const CardPayments = db_con.define("card_payments", {
    "name": {
        allowNull: false,
        unique: true,
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

    }
    
})

module.exports = CardPayments