const { config } = require('../config')
const User = require('../models/Users')
const UserLevels = require('../models/UserLevels')

const create_users_table = ()=>{
    User.sync({force: true}).then(()=>{
    
    config.logger.info('users table created')
}).catch(err=>{
    config.logger.info(err)
})
}

const create_user_levels_table = ()=>{
    UserLevels.sync({force: true}).then(()=>{
    
    config.logger.info('user_levels table created')
}).catch(err=>{
    config.logger.info(err)
})
}

create_users_table();
create_user_levels_table();