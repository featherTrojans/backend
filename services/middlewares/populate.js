const {UserLevels} = require('../../models/')


UserLevels.create({
    level: 1,
    privilege: JSON.stringify({
        funding: 150000,
        wallet: 10000,
        cashWithdrawal: 1000,
        totalCashWithdrawal: 5000,
        transfer: 1000,
        totalTransfer: 5000,
        deposit: 10000,
        bankWithdrawal: 0,
        totalBankWithdrawal: 0
    }),
    details: "Starter Level"
})

UserLevels.create({
    level: 2,
    privilege: JSON.stringify({
        funding: 1000000,
        wallet: 5000000,
        cashWithdrawal: 50000,
        totalCashWithdrawal: 100000,
        transfer: 100000,
        totalTransfer: 500000,
        deposit: 50000,
        bankWithdrawal: 50000,
        totalBankWithdrawal: 500000
    }),
    details: "Odogwu Level"
})

UserLevels.create({
    level: 3,
    privilege: JSON.stringify({
        funding: 5000000,
        wallet: 20000000,
        cashWithdrawal: 100000,
        totalCashWithdrawal: 300000,
        transfer: 500000,
        totalTransfer: 1000000,
        deposit: 1000000,
        bankWithdrawal: 100000,
        totalBankWithdrawal: 500000
    }),
    details: "Agent Level"
})