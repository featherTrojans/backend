const { config } = require('../../config');
const { Users, Transactions } = require('../../models');
require('../../subscribers')
const { eventEmitter, dollarUSLocale } = config


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
            amount, //data?.charges ? (amount - data.charges) : amount,
            finalBal,
            description,
            reference: data.id ? data.id : reference,
            direction: "out",
            title: data?.title ?? 'funding',
            charges: data?.charges ?? 0
        }) : 
        await Transactions.create({
            userUid,
            transId: reference,
            initialBal: walletBal,
            amount, //data?.charges ? (amount - data.charges): amount,
            finalBal,
            description,
            from: data.from,
            to: data.to,
            reference: data.id ? data.id : reference,
            direction: "out",
            title: data?.title ?? 'funding',
            charges: data?.charges ?? 0
        })
        const message = `@${username}, NGN${dollarUSLocale.format(amount)}, has left your account. Your new bal: ${finalBal}`;
        eventEmitter.emit('walletCredit', {email, message})
        eventEmitter.emit('send', {phoneNumber, message})
        eventEmitter.emit('notification', {userUid, title: data?.title ?? 'funding', description: `Hey, NGN ${dollarUSLocale.format(amount)} just left your primary wallet`})
        return true;
    } else {
        return false;
    }

}

module.exports = debitService