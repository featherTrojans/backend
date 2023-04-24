const { config } = require('../../config');
const { Users, Transactions } = require('../../models');
require('../../subscribers')
const { eventEmitter, logger, dollarUSLocale, firebaseDB, set, ref } = config


const creditService = async (data) => {
    try {
        const { userUid, reference, amount } = data
        const { walletBal, escrowBal, username, phoneNumber, email, fullName } = await Users.findOne({attributes: ['walletBal', 'phoneNumber', 'username', 'email', 'fullName', 'escrowBal'], where: {userUid}})
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
            description: data?.description ?? `${amount} Funding`,
            reference: data.id ? data.id : reference,
            title: data?.title ?? 'Wallet Credit'
        }) : 
        await Transactions.create({
            userUid,
            transId: reference,
            initialBal: walletBal,
            amount,
            finalBal,
            description: data?.description ??  `${amount} Funding`,
            from: data.from,
            to: data.to,
            reference: data.id ? data.id : reference,
            title: data?.title ?? 'Wallet Credit'
        })

        let obj = {
            userUid,
            walletBal: finalBal
        }
        //update
        let firebasUpdate = await firebaseDB.doc(userUid).set(obj)

        // console.log(firebasUpdate)
        var firstname = (fullName.split(" "))[1]
        const message = `Feather: Dear ${firstname}, NGN${dollarUSLocale.format(amount)} just entered your account. Your new balance is: NGN${dollarUSLocale.format(finalBal)}`;
    
        eventEmitter.emit('walletCredit', {email, message})
        eventEmitter.emit('send', {phoneNumber, message})
        eventEmitter.emit('notification', {userUid, title: data?.title ?? 'Wallet Credit', description: `Hey you just got credited NGN${dollarUSLocale.format(amount)} in your primary wallet from ${data?.from && data.from != 'Bonus' ? '@'+ (data.from).toLowerCase() : data.from != 'Bonus' ? 'Wallet Funding' : data.from}`})
        
    } catch (error) {
        logger.info(error)
    }


}

module.exports = creditService