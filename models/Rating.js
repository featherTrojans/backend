const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const Rating = db_con.define("ratings", {

    "userUid": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },

    "rating": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },

    "userToRate": {
        allowNull: false,
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
    "description": {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
           notEmpty: true
        }
    },
    
})

module.exports = Rating