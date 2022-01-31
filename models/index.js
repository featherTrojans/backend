const Users = require('../models/Users')
const UserLevels = require('../models/UserLevels')
const Transactions = require('../models/Transactions')
const Payments = require('../models/Payments')
const DoubleSpent = require('../models/DoubleSpent')

const models = {
    Users,
    UserLevels,
    Transactions,
    Payments,
    DoubleSpent
}

module.exports = models