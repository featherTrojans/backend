const { config } = require('../config')
const { 
    Transactions, DoubleSpent, Users, 
    UserLevels, Payments, Location, 
    LocationHistory, Request, Status } = require('../models/')

const create_users_table = ()=>{
    Users.sync({force: true}).then(()=>{
    
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

const create_transactions_table = ()=>{
    Transactions.sync({force: true}).then(()=>{
    
    config.logger.info('transactions table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_payments_table = ()=>{
    Payments.sync({force: true}).then(()=>{
    
    config.logger.info('payments table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_double_spent_table = ()=>{
    DoubleSpent.sync({force: true}).then(()=>{
    
    config.logger.info('double_spents table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_location_table = ()=>{
    Location.sync({force: true}).then(()=>{
    
    config.logger.info('locations table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_location_histories_table = ()=>{
    LocationHistory.sync({force: true}).then(()=>{
    
    config.logger.info('location_histories table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_requests_table = ()=>{
    Request.sync({force: true}).then(()=>{
    
    config.logger.info('requests table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_statuses_table = ()=>{
    Status.sync({force: true}).then(()=>{
    
    config.logger.info('statuses table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

create_users_table();
create_user_levels_table();
create_transactions_table();
create_double_spent_table();
create_payments_table();
create_location_table()
create_location_histories_table()
create_requests_table()
create_statuses_table()