const { appendFileSync } = require('fs')
const Sequelize = require('sequelize')
const { config } = require('./')

exports.connection = new Sequelize(config.db_name, config.db_username, config.db_password, {
    dialect: 'mysql',
    host: config.db_host,
    logging: (msg) => {
        appendFileSync("db.out.log", msg + "\n \n", "UTF-8",{'flags': 'a+'});
    }
})
