const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Webhook = db_con.define("webhooks", {
    
    ip: {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },

    data: {
        allowNull: false,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = Webhook