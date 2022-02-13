const idGenService = require('./generateId')
const confirmData = require('./confirmData')
const codeGenerator = require('./generateCode')
const Authenticate = require('./middlewares/auth')
const TokenServices = require('./middlewares/tokenservices')
const PaystackServices = require('./middlewares/paystackServices')
const  creditService = require('./middlewares/creditService')
const  debitService = require('./middlewares/debitService')
const GoogleServices = require('./middlewares/googleServices')

exports.services = {
    creditService,
    debitService,
    idGenService,
    confirmData,
    codeGenerator,
    Authenticate,
    TokenServices,
    listBanks: PaystackServices.listBanks,
    initializeTransaction: PaystackServices.initializeTransaction,
    feeCharge: PaystackServices.feeCalculator,
    verifyTransaction: PaystackServices.verifyTransaction,
    distanceService: GoogleServices.distanceService
}