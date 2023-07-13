const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const CARD = db_con.define("cards", {
    
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }

    },
    "cardholder_id": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }
    },
    "card_id": {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true,
    },
    
    "brand": {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: "Visa2"
    },

    "type": {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: "Virtual"
    },
    "currency": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "USD"
    }
})

module.exports = CARD