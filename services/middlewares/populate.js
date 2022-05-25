const {UserLevels} = require('../../models/')


UserLevels.create({
    level: 1,
    privilege: JSON.stringify({
        funding: 150000,
        wallet: 150000,
        cashWithdrawal: 20000,
        totalCashWithdrawal: 80000,
        transfer: 50000,
        totalTransfer: 150000,
        deposit: 50000,
        bankWithdrawal: 10000,
        totalBankWithdrawal: 50000
    }),
    details: "Starter Level"
})

UserLevels.create({
    level: 2,
    privilege: JSON.stringify({
        funding: 1000000,
        wallet: 1000000,
        cashWithdrawal: 50000,
        totalCashWithdrawal: 200000,
        transfer: 100000,
        totalTransfer: 500000,
        deposit: 100000,
        bankWithdrawal: 50000,
        totalBankWithdrawal: 300000
    }),
    details: "Odogwu Level"
})