const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Request = db_con.define("requests", {
    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "transId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "statusId": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
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
    "amount": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "charges": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "total": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "agent": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "agentUsername": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "negotiatedFee": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "0",
        validate: {
           notEmpty: true
        }
    }, 
    "status": {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "PENDING",
        validate: {
           notEmpty: true
        }
    },

    "reasonForCancel": {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
           notEmpty: true
        }
    },
    "meetupPoint": {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
           notEmpty: true
        }
    },
    
})

module.exports = Request