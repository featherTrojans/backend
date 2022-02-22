const AuthController = require('./AuthController')
const HomeController = require('./HomeController')
const DashboardController = require('./DashboardController')
const FundsController = require('./FundsController')
const WebhookController = require('./WebhookController')
const TransferController = require('./TransferController')
const RequestController = require('./RequestControllers')
const StatusController = require('./StatusController')
const TransactionsController = require('./TransactionsController')

module.exports = {
    
    AuthController,
    HomeController,
    DashboardController,
    FundsController,
    WebhookController,
    TransferController,
    RequestController,
    StatusController,
    TransactionsController
}