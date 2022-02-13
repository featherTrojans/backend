const Controller = require('./controllers')

exports.controller = {
    home: Controller.HomeController.home,
    signup: Controller.AuthController.signup,
    confirmCode: Controller.AuthController.confirmCode,
    setPassword: Controller.AuthController.setPassword,
    setPin: Controller.AuthController.setPin,
    setUsername: Controller.AuthController.setUsername,
    signIn: Controller.AuthController.signIn,
    dashboard: Controller.DashboardController.dashboard,
    makePayment: Controller.FundsController.makePayment,
    verifyPayment: Controller.FundsController.verifyTransaction,
    webhook: Controller.WebhookController.webhook,
    transferFunds: Controller.TransferController.transferFunds,
    pendingRequests: Controller.RequestController.getPendingRequests,
    acceptedRequests: Controller.RequestController.getAcceptedRequests,
    cancelRequest: Controller.RequestController.cancelRequests,
    createRequest: Controller.RequestController.createRequest,
    markRequest: Controller.RequestController.markRequests,
    createStatus: Controller.StatusController.createStatus,
    findStatus: Controller.StatusController.findStatus
}