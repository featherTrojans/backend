const { sendRequestWebhook } = require('../services/middlewares/requestService')
const Controller = require('./controllers')

exports.controller = {
    home: Controller.HomeController.home,
    signup: Controller.AuthController.signup,
    confirmCode: Controller.AuthController.confirmCode,
    setPassword: Controller.AuthController.setPassword,
    setPin: Controller.AuthController.setPin,
    setUsername: Controller.AuthController.setUsername,
    signIn: Controller.AuthController.signIn,
    agentsignup: Controller.AgentAuthController.signup,
    agentconfirmCode: Controller.AgentAuthController.confirmCode,
    agentsetPassword: Controller.AgentAuthController.setPassword,
    agentsetPin: Controller.AgentAuthController.setPin,
    agentsetUsername: Controller.AgentAuthController.setUsername,
    agentsignIn: Controller.AgentAuthController.signIn,
    signInTwo: Controller.AuthController.signInTwo,
    signUpTwo: Controller.AuthController.signupTwo,
    confirmLoginCode: Controller.AuthController.confirmLoginCode,
    confirmRegisterCode: Controller.AuthController.confirmRegisterCode,
    createProfile: Controller.ProfileController.createProfile,
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
    agentresendCode: Controller.AgentAuthController.resendCode,
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
    agentVerifyPin: Controller.PinVerificationController.agentVerifyPin,
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
    vfdwebhook: Controller.VfdWebhookController.webhook,
    upgradeUser: Controller.UpgradeController.upgradeUser,
    createCollectionAcc: Controller.CollectionController.createCollectionAccountNum,
    confirmBvnCode: Controller.BvnCodeController.confirmBvnCode,
    cronJob: Controller.CronController.CronController,
    mnig_webhook: Controller.MNIGController.webhook,
    sendPushNotif: Controller.AdminMessageController.sendPushNotification,
    sendSmsNotif: Controller.AdminMessageController.sendSmsNotification,
    sendEmailNotif: Controller.AdminMessageController.sendEmailNotification,
    createAgent: Controller.AgentController.signup,
    approveAgent: Controller.AgentController.approve,
    makeMarketer: Controller.MarketingController.makeMarketer,
    getMarketer: Controller.MarketingController.getMarketer,
    createSecurityQuestion: Controller.SecurityQuestionController.createSecurityQuestions,
    userEmailControllers: Controller.UserEmailControllers.allEmails,
    completeAgentReg: Controller.AgentAuthController.completeReg,
    switchStatus: Controller.AgentController.switchStatus,
    updateLocation: Controller.AgentController.updateLocation,
    agentDashboard: Controller.AgentDashController.dashboard,
    getMerchant: Controller.UserController.getMerchant,
    getUserWtoutLog: Controller.UserController.getUserWtoutLog,
    sendRequestWebhook: Controller.RequestWebhookController.webhook,
    transferFundsToAgent: Controller.TransferController.transferFundsToAgent,
    createCard: Controller.CardController.createUserCard,
    getCardDetails: Controller.CardController.getCardDetails,
    bridgeWebhok: Controller.BridgeWebhookController.bridgeCardwebhook
}