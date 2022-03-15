const {Users, Transactions, Request} = require('../models/') 

Users.hasMany(Transactions, {foreignKey: 'userUid'})
Transactions.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Request.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})