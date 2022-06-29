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
    findStatus: Controller.StatusController.findStatus,
    resendCode: Controller.AuthController.resendCode,
    getTransactions: Controller.TransactionsController.transactions,
    docs: Controller.HomeController.docs,
    users: Controller.UserController.getUser,
    getAccount: Controller.AccountController.getAccount,
    withdraw: Controller.WithdrawalController.withdrawFund,
    getBalance: Controller.BalanceController.getBalance,
    getRequestStatus: Controller.RequestController.getRequestStatus,
    approveRequest: Controller.ApproveRequestController.approveRequest,
    createNegotiation: Controller.NegotiationController.createNegotiation,
    createToken: Controller.MessageController.createToken,
    verifyPin: Controller.PinVerificationController.verifyPin,
    getDepPendingRequests: Controller.DepositorController.getDepPendingRequests,
    getDepAcceptedRequests: Controller.DepositorController.getDepAcceptedRequests,
    updatePersonalData: Controller.UserController.updatePersonalData,
    updateBasicData: Controller.UserController.updateBasicData,
    buyAirtime: Controller.AirtimeController.buyAirtime,
    buyElect: Controller.ElectricityController.buyElect,
    getAllBills: Controller.BillsController.allBills,
    getAllStatuses: Controller.StatusController.allStatus,
    uploadFile: Controller.UploadController.uploadImages,
    updateStatus: Controller.StatusController.UpdateStatus,
    sendForgotPswdCode: Controller.ForgotPasswordController.sendForgotPasswordCode,
    setNewPassword: Controller.ForgotPasswordController.setNewPassword,
    updateStatusLocation: Controller.StatusController.UpdateStatusLocation,
    rateUser: Controller.RatingsController.rateUser,
    getAllNotifications: Controller.NotificationController.notifications,
    changePassword: Controller.ForgotPasswordController.changePassword,
    stats: Controller.AdminController.stats,
    referralStats: Controller.ReferralController.referralStats,
    getMultipleUser: Controller.UserController.getMultipleUser,
    verifyUsers: Controller.VerificationController.verifyUser,
}