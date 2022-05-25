const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Users = db_con.define("users", {
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
    "escrowBal": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0,
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
    "pin_attempts": {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    "refId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
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

    "gender": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },

    "address": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },

    "lga": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },

    "dateOfBirth": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },

    "referredBy": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "imageUrl": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
})
module.exports = Users