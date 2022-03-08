const { config } = require("../../config");
const { Users } = require("../../models");
const {logger} = config

exports.getBalance = ( async (userUid ) => {

    try
    {
        const {walletBal, escrowBal} = await Users.findOne({attributes: ['walletBal', 'escrowBal'], where: {userUid}});
        const bal = parseFloat(walletBal) + parseFloat(escrowBal) //wallet bal + escrow bal
    
        return bal


    } catch (error) {
        logger.info(error)
        return false
    }
});