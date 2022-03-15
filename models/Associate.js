const Users = require('./User') 
const Transactions = require('./Transaction')

Users.hasMany(Transactions, {foreignKey: 'userUid'})
Transactions.belongsTo(Users, {foreignKey: 'userUid', targetKey: 'userUid'})