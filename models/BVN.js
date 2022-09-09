const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const BVN = db_con.define("bvns", {
    
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }

    },
    "bvn": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }
    },
    "firstname": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "lastname": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "middlename": {
        allowNull: true,
        type: Sequelize.STRING,
    },
    "gender": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "dateOfBirth": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "phoneNumber": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "isVerified": {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        validate : {
           notEmpty: true
        }
    },
    "codeToSend": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
})

module.exports = BVN