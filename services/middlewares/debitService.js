const { config } = require('../../config');
const { Users, Transactions } = require('../../models');
require('../../subscribers')

const { eventEmitter, dollarUSLocale, firebaseDB, logger } = config


const debitService = async (data) => {
    
    const { userUid, reference, amount, description } = data
    const { walletBal, username, phoneNumber, email, fullName, escrowBal } = await Users.findOne({attributes: ['walletBal', 'phoneNumber', 'username', 'email', 'fullName', 'escrowBal'], where: {userUid}})
    if (parseFloat(walletBal) >= parseFloat(amount)) {
        const finalBal = (parseFloat(walletBal)) - parseFloat(amount)
        const balToShow = (parseFloat(escrowBal) + parseFloat(walletBal)) - parseFloat(amount)
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
        let obj = {
            userUid,
            walletBal: finalBal
        }
        //update
        try{
            let firebasUpdate = await firebaseDB.doc(userUid).set(obj)
            // console.log(firebasUpdate)
            var firstname = (fullName.split(" "))[1]
            const message = `Feather: Dear ${fullName}, NGN${dollarUSLocale.format(amount)} has left your account. Your new balance is: NGN${balToShow}`;
            eventEmitter.emit('walletCredit', {email, message})
            eventEmitter.emit('send', {phoneNumber, message})
            eventEmitter.emit('notification', {userUid, title: data?.title ?? 'funding', description: `Hey, NGN${dollarUSLocale.format(amount)} just left your primary wallet`})
            return true;
        } catch (error) {
            logger.info(error)
        }
    } else {
        return false;
    }

}

module.exports = debitService