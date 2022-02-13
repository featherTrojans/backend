const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const LocationHistory = db_con.define("location_histories", {
    "userUid": {
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
    
})

module.exports = LocationHistory