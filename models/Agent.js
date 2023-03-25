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
    "username": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "fullName": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "phoneNumber": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "email": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "isVerified": {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false

    },
    "walletBal": {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.00,
        validate : {
           notEmpty: true
        }

    },
    "userLevel": {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
    "code": {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "pin": {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "password": {
        allowNull: true,
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
    "accountNo": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "bvn": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "business_name": {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "daily_transaction": {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "business_category": {
        allowNull: true,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }

    },
    "full_address": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "bus_phone_number": {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "status": {
        defaultValue: "OFF",
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    "messageToken": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "pin_attempts": {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
    "longitude": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "latitude": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "locationText": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "charges_cat_one": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
    "charges_cat_two": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
    "charges_cat_three": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
    "charges_cat_four": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0,
        validate : {
           notEmpty: true
        }

    },
})
module.exports = Agents