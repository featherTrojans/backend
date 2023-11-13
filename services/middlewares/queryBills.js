const { config } = require('../../config');
const cron = require('node-cron');
const { NewBills, Transactions } = require('../../models');
const {logger, environment, Op} = config
let timeService = require("./timeservice");
const creditService = require('./creditService');
const { query_trans } = require('./mobilenigService');


const queryAirtime = async (fifteen_mins_ago = timeService.serverTime().fifteen_mins_ago) => {
    //search withdrawals in the last 15 minutes
    console.log('fifteen_mins_ago', fifteen_mins_ago)

    let transactions = await NewBills.findAll({
        where: {status: 'processing',
            createdAt: {[Op.lt]: fifteen_mins_ago},
            },
        order: [['createdAt', 'DESC']],
        limit: 10
    })
    // console.log(transactions)
    if ( transactions.length > 0 ) {
        for (const [key, value] of Object.entries(transactions)){
            // console.log(value.reference)
            let {amount, userUid, reference, status, createdAt} = value
            query_transaction = await query_trans(reference)
            
            console.log(Date.parse(createdAt) > Date.parse('2023-05-07 23:59:00'));

            if ((query_transaction.statusCode === 'EXC020' || query_transaction.statusCode === 'EXC013') && status.toLowerCase() == 'processing' && Date.parse(createdAt) > Date.parse('2023-11-01 23:59:00')) {
                // console.log(`${amount}`)

                //refund
                let { description } = await Transactions.findOne({
                    where: {reference}
                })
                await NewBills.update(
                    {status: 'FAILED'},
                    {where: {reference}}
                )
                await creditService({userUid, reference: "FTHRVRSL" + reference, amount, description: `NGN${description} reversal`, title: 'Fund Reversal', from: 'fund reversal', to: 'primary wallet' })
                console.log(userUid, 'status', query_transaction.statusCode, 'updated successfully and refunded successfully')
            } else if (query_transaction.statusCode == '200' ) {
                //update bills
                let {details} = query_transaction
                NewBills.update(
                    {status: details.status == 'Approved' ? 'SUCCESS' :'PROCESSING'},
                    {where: {reference}}
                )
                console.log(userUid, reference, 'status', query_transaction.statusCode, 'updated successfully')
            } else {
                //continue
                console.log('No condition met')
            }
            // update
            await Transactions.update({isQueried: true}, {where: {reference}})
        }
    } else {
        console.log('No Airtime to query')
    }

    
}

// queryAirtime()

cron.schedule('* * * * *', function() {
    queryAirtime()
});