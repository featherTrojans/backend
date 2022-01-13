const idGenService = require('./generateId')
const confirmData = require('./confirmData')
const codeGenerator = require('./generateCode')
const Authenticate = require('./middlewares/auth')
const TokenServices = require('./middlewares/tokenservices')

exports.services = {
    idGenService,
    confirmData,
    codeGenerator,
    Authenticate,
    TokenServices,
}