const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Notification = db_con.define("notifications", {

    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },

    "title": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },

    "isRead": {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        validate : {
           notEmpty: true
        }

    },
    "reference": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "description": {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
           notEmpty: true
        }
    },
    
})

module.exports = Notification