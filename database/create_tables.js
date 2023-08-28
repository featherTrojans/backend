const { config } = require('../config')
const { 
    Transactions, DoubleSpent, Users, 
    UserLevels, Payments, Location, 
    LocationHistory, Request, Status, BankAccount, Withdrawal,
    Bills, Rating, Notification, BVN, Webhook, CollectionAccounts,
    VfdPayment,
    Agents,
    Card,
    NairaToUsd,
    CardHistory,
    Beneficiary
} = require('../models/')
const CardPayments = require('../models/CardPayments')
const NewBills = require('../models/NewBills')

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

const create_bank_accounts_table = ()=>{
    BankAccount.sync({force: true}).then(()=>{
    
    config.logger.info('bank_accounts table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_withdrawals_table = ()=>{
    Withdrawal.sync({force: true}).then(()=>{
    
    config.logger.info('withdrawals table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_bills_table = ()=>{
    Bills.sync({force: true}).then(()=>{
    
    config.logger.info('bills table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_ratings_table = ()=>{
    Rating.sync({force: true}).then(()=>{
    
    config.logger.info('ratings table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}
const create_notifications_table = ()=>{
    Notification.sync({force: true}).then(()=>{
    
    config.logger.info('notifications table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_bvns_table = ()=>{
    BVN.sync({force: true}).then(()=>{
    
    config.logger.info('bvns table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_webhooks_table = ()=>{
    Webhook.sync({force: true}).then(()=>{
    
    config.logger.info('webhooks table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_collections_table = ()=>{
    CollectionAccounts.sync({force: true}).then(()=>{
    
    config.logger.info('collection_accounts table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}
const create_vfd_payments_table = ()=>{
    VfdPayment.sync({force: true}).then(()=>{
    
    config.logger.info('vfd_payments table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}
const create_agents_table = ()=>{
    Agents.sync({force: true}).then(()=>{
    
    config.logger.info('agents table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_n_bills_table = ()=>{
    NewBills.sync({force: true}).then(()=>{
    
    config.logger.info('n_bills table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_cards_table = ()=>{
    Card.sync({force: true}).then(()=>{
    
    config.logger.info('cards table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_rates_table = ()=>{
   NairaToUsd.sync({force: true}).then(()=>{
    
    config.logger.info('Naira to usd table created')
    }).catch(err=>{
        config.logger.debug(err)
    })
}

const create_card_payments_table = ()=>{
  CardPayments.sync({force: true}).then(()=>{
     
     config.logger.info('card payments table created')
     }).catch(err=>{
         config.logger.debug(err)
     })
 }
 const create_card_histories_table = ()=>{
   CardHistory.sync({force: true}).then(()=>{
       
       config.logger.info('card histories table created')
       }).catch(err=>{
           config.logger.debug(err)
       })
   }

   const create_beneficiaries_table = ()=>{
    Beneficiary.sync({force: true}).then(()=>{
        
        config.logger.info(' beneficiaries table created')
        }).catch(err=>{
            config.logger.debug(err)
        })
    }

// create_users_table();
// create_user_levels_table();
// create_transactions_table();
// create_double_spent_table();
// create_payments_table();
// create_location_table()
// create_location_histories_table()
// create_requests_table()
// create_statuses_table()
// create_bank_accounts_table()
// create_withdrawals_table()
// create_bills_table()
// create_ratings_table()
// create_notifications_table()
// create_bvns_table()
// create_webhooks_table()
// create_collections_table()
// create_vfd_payments_table()
// create_agents_table()
// create_n_bills_table()
// create_cards_table()
// create_rates_table()
// create_card_payments_table()
// create_card_histories_table()
// create_beneficiaries_table()