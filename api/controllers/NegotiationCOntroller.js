const { config } = require("../../config");
const { validationResult } = require('express-validator');
const { Request, Users } = require("../../models");
const {logger, Op, eventEmitter, dollarUSLocale} = config
require('../../subscribers')


exports.createNegotiation = ( async (req, res) => {

    const { negotiatedFee, reference } = req.body
    const {userId, username} = req.user
    const errors = validationResult(req);
    try
    {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!negotiatedFee || !reference ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "negotiatedFee and reference is required"
            })
        } else {

            const {userUid, agentUsername } = await Request.findOne({where: {reference}})
            const user = await Users.findOne({
                where: {userUid},
                attributes: ['email', 'fullName', 'username', 'phoneNumber', 'walletBal']
            })

            const agent = await Users.findOne({
                where: {username: agentUsername},
                attributes: ['email', 'fullName', 'username', 'phoneNumber', 'userUid']
            })

            if (negotiatedFee > walletBal) {
                return res.status(404).json({
                    status: false,
                    data: {},
                    message: 'Insufficient balance'
                })
            } else {

                Request.update({negotiatedFee}, {where: {
                    [Op.or]: {
                        userUid: userId,
                        agentUsername: agent.username
                    }, reference}}).then((data) => {
                    if (data[0] > 0 ) {
    
                        const message = `Dear @${user.username}, your cash withdrawal ${reference} fee has been negotiated to ${dollarUSLocale.format(negotiatedFee)}`;
                        eventEmitter.emit('negotiateFee', {email: user.email, message})
    
                        //send to agent 
                        const agentMessage = `Dear @${agent.username}, your cash withdrawal ${reference} fee has been negotiated to NGN${dollarUSLocale.format(negotiatedFee)}`;
                        eventEmitter.emit('negotiateFee', {email: agent.email, message: agentMessage})

                        //notify withdrawal
                        eventEmitter.emit('notification', {userUid: agent.userUid, title: 'Cash Withdrawal', description: `Hey your cash withdrawal ${reference} fee has been negotiated to NGN${dollarUSLocale.format(negotiatedFee)} by @${user.username}`, redirectTo: 'Notifications'})
    
                        //notify depositor
                        eventEmitter.emit('notification', {userUid: userId, title: 'Cash Withdrawal', description: `Hey your cash withdrawal ${reference} fee has been negotiated to NGN${dollarUSLocale.format(negotiatedFee)}`, redirectTo: 'Notifications'})
    
                        return res.status(200).json({
                            status: true,
                            data: {
                                negotiatedFee,
                                reference
                            },
                            message: "success"
                        })
                    } else {
                        return res.status(404).json({
                            status: false,
                            data: {},
                            message: `No request ${reference}`
                        })
                    }
                }).catch((err) => {
                    logger.info(err)
                    return res.status(400).json({
                        status: false,
                        data: {},
                        message: "error"
                    })
                })
    
            }

            

        }
        

    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "Ops something went wrong!!!!! error occur"
        })
    }
});