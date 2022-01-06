const { config } = require('../config')
const User = require('../models/Users')

const create_users_table = ()=>{
    User.sync({force: true}).then(()=>{
    
    config.logger.info('users table created')
}).catch(err=>{
    config.logger.info(err)
})
}

create_users_table();