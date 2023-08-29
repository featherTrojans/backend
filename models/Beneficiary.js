const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Beneficiary = db_con.define("beneficiaries", {
    
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "data": {
        allowNull: false,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }
    },
    "beneficiary_type": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: false,
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = Beneficiary