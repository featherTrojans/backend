const db_con = require('../config/database').connection
const Sequelize = require('sequelize')


const CollectionAccounts = db_con.define("collection_accounts", {
    
    "userUid": {
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
    "middlename": {
        allowNull: true,
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
    "bvn": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "phone": {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate : {
           notEmpty: true
        }
    },
    "dob": {
        allowNull: false,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    "accountNo": {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate : {
           notEmpty: true
        }
    },
    
})

module.exports = CollectionAccounts