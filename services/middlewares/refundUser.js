const { Request, Users } = require("../../models");

const refundUser = async (reference) => {

    //get userId 
    const { userUid, charges, negotiatedFee, amount} = await Request.findOne({
    where: {reference},
    attributes: ['userUid', 'agentUsername', 'statusId', 'charges', 'negotiatedFee', 'amount']
    });
    const total = (parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee))

    let {escrowBal, walletBal } = await Users.findOne({
        where: {userUid},
        attributes: ['escrowBal', 'walletBal']
    });

    const newEscrowBal = parseFloat(escrowBal) - parseFloat(total);
    const newWalletBal = parseFloat(walletBal) + parseFloat(total)
    await Users.update({escrowBal: newEscrowBal,  walletBal: newWalletBal }, {where: {userUid}});
}

module.exports = refundUser