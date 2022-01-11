const HomeController = require('./controllers/HomeController')
const AuthController = require('./controllers/AuthController')

exports.controller = {
    "home": HomeController.home,
    "signup": AuthController.signup
}