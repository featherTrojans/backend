require('custom-env').env();
const pino = require('pino')
const expressPino = require('express-pino-logger')
const events = require('events')
const eventEmitter = new events.EventEmitter();

const logger = pino({level: process.env.LOG_LEVEL || 'info'})
const expressLogger = expressPino({logger})

exports.config = {
    "port": process.env.PORT,
    "host": process.env.HOST,
    "environment": process.env.NODE_ENV,
    "db_password": process.env.DB_PASSWORD,
    "db_name": process.env.DB_NAME,
    "db_host": process.env.DB_HOST,
    "db_url": process.env.DB_URL,
    "db_username": process.env.DB_USER,
    "mail_username": process.env.MAIL_USERNAME,
    "mail_password": process.env.MAIL_PASSWORD,
    "mail_encryption": process.env.MAIL_ENCRYPTION,
    "mail_from_name": process.env.MAIL_FROM_NAME,
    "mail_from_address": process.env.MAIL_FROM_ADDRESS,
    "jwt_secret": process.env.JWT_SECRET,
    "log_level" : process.env.LOG_LEVEL,
    expressLogger,
    logger,
    eventEmitter
    

}