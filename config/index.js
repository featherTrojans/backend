require('custom-env').env();
const pino = require('pino')
const expressPino = require('express-pino-logger')
const events = require('events')
const eventEmitter = new events.EventEmitter();
const {Client} = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const googleMapsClient = require('@google/maps')
const d = new Date();
const time = d.getTime();
const yesterday = time - ( 24 * 3600 * 1000)
const logger = pino({level: process.env.LOG_LEVEL || 'info'})
const expressLogger = expressPino({logger})
const {Op} = require('sequelize');
const { initializeApp } = require("firebase-admin/app");
const firebaseApp = initializeApp();
const fcmNode = require('fcm-node');
const fcm = new fcmNode(process.env.SERVER_KEY)
let dollarUSLocale = Intl.NumberFormat('en-US');
var dd = String(d.getDate()).padStart(2, '0');
var mm = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = d.getFullYear();

let today =  yyyy + '-' + mm + '-' + dd;
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
    eventEmitter,
    time,
    yesterday,
    client,
    "twilio_sid": process.env.TWILIO_ACCOUNT_SID,
    "twilio_auth_token": process.env.TWILIO_AUTH_TOKEN,
    "twilio_sender_number": process.env.TWILIO_SENDER_NUMBER,
    "paystack_test_key": process.env.PAYSTACK_PRY_KEY,
    "paystack_secret_key": process.env.PAYSTACK_SECRET_KEY,
    "google_key": process.env.GOOGLE_MAPS_API_KEY,
    Op,
    gmail_address: process.env.GMAIL_ADDRESS,
    gmail_password: process.env.GMAIL_PASSWORD,
    client_id: process.env.GOOGLE_MAPS_CLIENT_ID,
    googleMapsClient,
    paygold_username: process.env.BILLSUSER,
    paygold_pass: process.env.BILLSPWD,
    paygold_url: process.env.BILLSURL,
    aws_secret:  process.env.AWS_SECRET_ACCESS_KEY,
    aws_access: process.env.AWS_ACCESS_KEY,
    firebaseApp,
    fcm,
    dollarUSLocale,
    yesterday,
    today
    

}