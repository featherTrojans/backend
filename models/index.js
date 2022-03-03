const Users = require('./User')
const UserLevels = require('./UserLevel')
const Transactions = require('./Transaction')
const Payments = require('./Payment')
const DoubleSpent = require('./DoubleSpent')
const Location = require('./Location')
const LocationHistory = require('./LocationHistory')
const Request = require('./Request')
const Status = require('./Status')
const BankAccount = require('./BankAccount')
const Withdrawal = require('./Withdrawal')

const models = {
    Users,
    UserLevels,
    Transactions,
    Payments,
    DoubleSpent,
    Location,
    LocationHistory,
    Request,
    Status,
    BankAccount,
    Withdrawal
}

module.exports = models