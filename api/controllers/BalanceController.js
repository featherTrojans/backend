const { config } = require("../../config");
const { Users } = require("../../models");
const {logger} = config

exports.getBalance = ( async (req, res) => {

    const { userId, username } = req.user
    try
    {
        const {walletBal, escrowBal} = await Users.findOne({attributes: ['walletBal', 'escrowBal'], where: {userUid: userId}});
        const bal = parseFloat(walletBal) + parseFloat(escrowBal) //wallet bal + escrow bal
    
        return res.status(200).json({
            status: true,
            data : {
                userId,
                username,
                walletBal: bal,

            },
            message: "success"
        })


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});