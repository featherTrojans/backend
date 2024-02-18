const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const BlackListedTokens = db_con.define("blacklisted_tokens", {
    
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "token": {
        allowNull: false,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }
    }
    
})

module.exports = BlackListedTokens