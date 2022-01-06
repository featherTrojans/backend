const Sequelize = require('sequelize')
const { config } = require('.')

exports.connection = new Sequelize(config.db_name, config.db_username, config.db_password, {
    "dialect": 'mysql'
})