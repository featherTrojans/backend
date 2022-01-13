const Controller = require('./controllers')

exports.controller = {
    "home": Controller.HomeController.home,
    "signup": Controller.AuthController.signup,
    "confirmCode": Controller.AuthController.confirmCode,
}