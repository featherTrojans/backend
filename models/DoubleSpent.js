const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const DoubleSpent = db_con.define("double_spents", {
    
    "transId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "username": {
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
    }
})

module.exports = DoubleSpent