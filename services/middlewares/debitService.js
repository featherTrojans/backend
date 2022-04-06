const { config } = require('../../config');
const { Users, Transactions } = require('../../models');
require('../../subscribers')
const eventEmitter = config.eventEmitter


const debitService = async (data) => {
    
    const { userUid, reference, amount, description } = data
    const { walletBal, username, phoneNumber, email } = await Users.findOne({attributes: ['walletBal', 'phoneNumber', 'username', 'email'], where: {userUid}})
    if (parseFloat(walletBal) >= parseFloat(amount)) {
        const finalBal = parseFloat(walletBal) - parseFloat(amount)
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
            description,
            reference: data.id ? data.id : reference,
            direction: "out",
            title: data?.title ?? 'funding'
        }) : 
        await Transactions.create({
            userUid,
            transId: reference,
            initialBal: walletBal,
            amount,
            finalBal,
            description,
            from: data.from,
            to: data.to,
            reference: data.id ? data.id : reference,
            direction: "out",
            title: data?.title ?? 'funding'
        })
        const message = `@${username}, #${amount}, has left your account. Your new bal: ${finalBal}`;
        eventEmitter.emit('walletCredit', {email, message})
        eventEmitter.emit('send', {phoneNumber, message})
        eventEmitter.emit('notification', {userUid, title: data?.title ?? 'funding', description})
        return true;
    } else {
        return false;
    }

}

module.exports = debitService