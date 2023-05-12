const idGenService = require('./generateId')
const confirmData = require('./confirmData')
const confirmAgentData = require('./confirmAgentData')
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
const cloudServices = require('./middlewares/cloudinaryServices')
const vfdServices = require('./middlewares/vfdServices')
const timeService = require('./middlewares/timeservice')
const notifService = require('./middlewares/notificationServices')
const requestService = require('./middlewares/requestServices')
const cardService = require('./middlewares/cardServices')
const mobilenigService = require('./middlewares/mobilenigService')
const queryBills = require('./middlewares/queryBills')

exports.services = {
    confirmAccount,
    creditService,
    debitService,
    idGenService,
    confirmData,
    confirmAgentData,
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
    googleService: googleFileService.uploadFile,
    verifyBvn: PaystackServices.resolveBvn,
    cloudServices: cloudServices.uploadFile,
    createCollectionAccount: vfdServices.createAccount,
    queryBvn: vfdServices.queryBvn,
    timeService,
    notifService: notifService.notificationService,
    createRequest: requestService.createRequest,
    queryWithdrawals: PaystackServices.queryWithdrawals,
    getPayStackBalance: PaystackServices.getBalance,
    getMobileBal: mobilenigService.getBalance,
    sendRequestWebhook: requestServices.sendRequestWebhook,
    queryMobil: mobilenigService.query_trans
}