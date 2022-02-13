const Users = require('./User')
const UserLevels = require('./UserLevel')
const Transactions = require('./Transaction')
const Payments = require('./Payment')
const DoubleSpent = require('../models/DoubleSpent')
const Location = require('../models/Location')
const LocationHistory = require('../models/LocationHistory')
const Request = require('../models/Request')
const Status = require('../models/Status')

const models = {
    Users,
    UserLevels,
    Transactions,
    Payments,
    DoubleSpent,
    Location,
    LocationHistory,
    Request,
    Status
}

module.exports = models