const { Request, Users, Transactions } = require("../../models");

const refundUser = async (reference, isCard = false) => {
    if (isCard) {
       let {userUid, amount, description} =  await Transactions.findOne({
            where: {
                transId:reference
            }
        })
        let {walletBal } = await Users.findOne({
            where: {userUid},
            attributes: ['walletBal']
        });
        const newWalletBal = parseFloat(walletBal) + parseFloat(amount)
        Transactions.create({
            userUid,
            transId: 'RVSL-' + reference,
            initialBal: walletBal,
            amount,
            finalBal: newWalletBal,
            description: description + 'reversal',
            from: 'USD card',
            to: 'primary wallet',
            reference,
            title: 'Reversal',
        })
    await Users.update({walletBal: newWalletBal }, {where: {userUid}});
        return
    }
    //get userId 
    let { userUid, charges, negotiatedFee, amount, agreedCharge} = await Request.findOne({
    where: {reference},
    attributes: ['userUid', 'agentUsername', 'statusId', 'charges', 'negotiatedFee', 'amount', 'agreedCharge']
    });
    const total = (parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee) + parseFloat(agreedCharge))

    let {escrowBal, walletBal } = await Users.findOne({
        where: {userUid},
        attributes: ['escrowBal', 'walletBal']
    });

    const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
    const newWalletBal = parseFloat(walletBal) + parseFloat(total)
    await Users.update({escrowBal: newEscrowBal,  walletBal: newWalletBal }, {where: {userUid}});
}

module.exports = refundUser