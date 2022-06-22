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
    "acc_num": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "bank_name": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = BVN