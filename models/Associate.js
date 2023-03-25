const {Users, Transactions, Request, Notification, Agents} = require('../models/') 

Users.hasMany(Transactions, {foreignKey: 'userUid'})
Transactions.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Agents.hasMany(Transactions, {foreignKey: 'userUid'})
Transactions.belongsTo(Agents, {foreignKey: 'userUid', targetKey: 'userUid'})
Request.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Notification.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})
Notification.belongsTo(Agents, {foreignKey: 'userUid', targetKey: 'userUid'})