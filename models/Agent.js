const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Agents = db_con.define("agents", {
    "userUid": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "agentId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "business_name": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "daily_transaction": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "operating_states": {
        allowNull: false,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }

    },
    "full_address": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "phone_number": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "status": {
        defaultValue: "PENDING",
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    }
})
module.exports = Agents