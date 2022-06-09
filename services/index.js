const idGenService = require('./generateId')
const confirmData = require('./confirmData')
const codeGenerator = require('./generateCode')
const Authenticate = require('./middlewares/auth')
const TokenServices = require('./middlewares/tokenservices')
const PaystackServices = require('./middlewares/paystackServices')
const  creditService = require('./middlewares/creditService')
const  debitService = require('./middlewares/debitService')
const GoogleServices = require('./middlewares/googleServices')
const LocationServices = require('./middlewares/locationServices')
const sendEmail = require('./middlewares/emailService')
const confirmAccount = require('./confirmAccount')
const balanceService = require('./middlewares/balanceServices')
const requestServices = require('./middlewares/requestService')
const payBillService = require('./middlewares/mobilenigService')
const awsService = require('./middlewares/awsServices')
const LevelCheck  = require('./middlewares/levelCheck')
const termiiService = require('./middlewares/termiiService')
const googleFileService = require('./middlewares/googleFileService')

exports.services = {
    confirmAccount,
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
    distanceService: GoogleServices.distanceService,
    createLocation: LocationServices.createLocation,
    returnLocation: LocationServices.returnLocation,
    sendEmail,
    withdrawFund: PaystackServices.withdrawFund,
    addAccount: PaystackServices.addAccount,
    getBalance: balanceService.getBalance,
    getRequest: requestServices.getRequest,
    buyAirtimeData: payBillService.buyAirtimeData,
    buyLight: payBillService.buyLight,
    buyCable: payBillService.buyCable,
    awsService: awsService.uploadFile,
    LevelCheck,
    sendSMS: termiiService.sendSMS,
    googleService: googleFileService.uploadFile
}