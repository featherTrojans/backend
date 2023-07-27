const { appendFileSync, readFileSync } = require('fs')
const Sequelize = require('sequelize')
const { config } = require('./')

exports.connection = config.environment == 'live' ? new Sequelize(config.db_name, config.db_username, config.db_password, {
    dialect: 'mysql',
    host: config.db_host,
    dialectOptions: {
        ssl: {
            ca: readFileSync(__dirname + '/etc/ssl/certs/ca-certificate.crt')
        }
    },
    logging: (msg) => {
        appendFileSync("db.out.log", msg + "\n \n", "UTF-8",{'flags': 'a+'});
    }
}) : new Sequelize(config.db_name, config.db_username, config.db_password, {
    dialect: 'mysql',
    host: config.db_host,
    logging: (msg) => {
        appendFileSync("db.out.log", msg + "\n \n", "UTF-8",{'flags': 'a+'});
    }
})
