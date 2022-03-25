const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Status = db_con.define("statuses", {
    "username": {
        allowNull: false,
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
    "longitude": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "latitude": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "locationText": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "amount": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "status": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "ACTIVE",
        validate : {
           notEmpty: true
        }
    },
    "reference": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }
    },
    "duration": {
        allowNull: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    
    
})

module.exports = Status