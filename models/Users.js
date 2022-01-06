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
    "password": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "createdAt": {
        defaultValue: Sequelize.TIME,
        allowNull: false,
        type: Sequelize.DATE,
        set (valueToBeSet) { 
            this.setDataValue('createdAt', valueToBeSet)
        }
    },
    "updatedAt": {
        defaultValue: Sequelize.TIME,
        allowNull: false,
        type: Sequelize.DATE,
        set (valueToBeSet) { 
            this.setDataValue('updatedAt', valueToBeSet)
        }
    }
})

module.exports = Users