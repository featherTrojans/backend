const {Users, Transactions, Request, Notification} = require('../models/') 

Users.hasMany(Transactions, {foreignKey: 'userUid'})
Transactions.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Request.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Notification.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})