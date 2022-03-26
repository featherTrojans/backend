const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const UserLevels = db_con.define("user_levels", {
    "level": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    "privilege": {
        allowNull: false,
        type: Sequelize.TEXT,
        validate : {
           notEmpty: true
        }

    },
    "details": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }

    },
    
})

module.exports = UserLevels