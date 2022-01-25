const { config } = require('../../config');
const { Users, Transactions } = require('../../models');
require('../../subscribers')
const eventEmitter = config.eventEmitter


const creditService = async (data) => {
    
    const {userUid, reference, amount } = data
    const {walletBal, username, phoneNumber} = await Users.findOne({attributes: ['walletBal', 'phoneNumber', 'username'], where: {userUid}})
    const finalBal = parseFloat(amount) + parseFloat(walletBal)
    //update
    //user wallet
    await Users.update({walletBal: finalBal}, {where: {userUid}});
    //log history
    !(data.from) || !(data.to ) ? await Transactions.create({
        userUid,
        transId: reference,
        initialBal: walletBal,
        amount,
        finalBal,
        description: `${amount} Funding`
    }) : 
    await Transactions.create({
        userUid,
        transId: reference,
        initialBal: walletBal,
        amount,
        finalBal,
        description: `${amount} Funding`,
        from: data.from,
        to: data.to
    })
    const message = `@${username}, #${amount}, just entered your account. Your new bal: ${finalBal}`;
    eventEmitter.emit('send', {phoneNumber, message})
}

module.exports = creditService