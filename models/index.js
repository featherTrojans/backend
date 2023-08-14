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
const Bills = require('./Bills')
const Rating = require('./Rating')
const Notification = require('./Notification')
const BVN = require('./BVN')
const Webhook = require('./Webhook')
const CollectionAccounts = require('./CollectionAccount')
const VfdPayment = require('./VfdPayment')
const Agents = require('./Agent')
const NewBills = require('./NewBills')
const Card = require('./Card')
const NairaToUsd = require('./NairaToUsd')

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
    Withdrawal,
    Bills,
    Rating,
    Notification,
    BVN,
    Webhook,
    CollectionAccounts,
    VfdPayment,
    Agents,
    NewBills,
    Card,
    NairaToUsd
}

module.exports = models