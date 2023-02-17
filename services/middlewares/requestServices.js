const { config } = require("../../config");
const { Request, Users } = require("../../models");
const {logger, eventEmitter, dollarUSLocale } = config
// const {idGenService, timeService} = require("/services").services
const { validationResult } = require('express-validator')

require('../../subscribers')


 exports.createRequest = ( async (data) => {
    
    const { userUid, username, email, amount, charges, agent, agentUsername, statusId, meetupPoint, negotiatedFee  } = data
    
    const transId = idGenService(10);
    const errors = validationResult(req);

    logger.info(req.body)

    try
    {
        if (timeService.serverTime().now >= "00:00" && timeService.serverTime().now < "05:01") {
            return res.status(400).json({
                status : false,
                data: {},
                message: "Aw Padi!! Cash requests are not available during this period, try again later!!!"
            })
        } else if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!(amount || charges || agent || agentUsername || statusId || meetupPoint)) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "Aww padi! Something occurred; please try again later"
            })
        } else if (amount < 200 ) {
            return res.status(400).json({
                status : false,
                data: {},
                message: "Invalid request amount. Make a request of NGN200 and above"
            })
        } else {

            //find requests that are not completed or cancelled
            const activeRequests = await Request.findAll({
                where: {
                    userUid,
                    status: ['PENDING', 'ACCEPTED']
                }
            })

            if (activeRequests.length >= 3 ) {
                return res.status(400).json({
                    status: false,
                    data: {},
                    message: "Sorry Padi, you cannot have more than 3 active requests at a time!!!!"
                })
            } else {
                //check user balance before creating request

                const {walletBal, escrowBal} = await Users.findOne({where: {userUid}});
                const total = parseFloat(amount) + parseFloat(charges) + parseFloat(negotiatedFee)

                if (total <= walletBal) {
                    //debit user
                    const newEscrowBal = parseFloat(escrowBal) + parseFloat(total);
                    // const ref = userUid + config.time + walletBal;
                    // await new Promise(function(resolve, reject) {

                    //     const debitUser = debitService({userUid, reference: transId, amount: total, description: `#${total} cash withdrawal`, from: username, to: agentUsername, id: ref, title: "Wallet Debit"});

                    //     debitUser ? setTimeout(() => resolve("done"), 7000) : setTimeout(() => reject( new Error(`Cannot debit ${username}`)));
                    //     // set timer to 7 secs to give room for db updates

                    // })
                    // credit user escrow balance
                    Users.update({escrowBal: newEscrowBal, walletBal: parseFloat(walletBal - total)}, {where: {userUid}});
                    const agentData = await Users.findOne({
                        where: {username: agentUsername},
                        attributes: ['email', 'fullName', 'username', 'phoneNumber', 'userUid']
                    })
                    Request.create({

                        userUid,
                        amount,
                        charges,
                        agent,
                        agentUsername,
                        transId,
                        reference: transId,
                        total,
                        statusId,
                        meetupPoint,
                        negotiatedFee: negotiatedFee ? negotiatedFee : 0
        
                    }).then (() => {

                        const message = `Dear @${username}, you have a new cash withdrawal`;
                        eventEmitter.emit('createRequest', {email, message})
                        eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: 'Hey padi, your cash request has been successfully created', redirectTo: 'Withdraw'})
                        //send to agent 
                        const agentMessage = `Dear @${agentUsername}, you have a new cash withdrawal from @${username}, login to complete transaction`;
                        eventEmitter.emit('notification', {userUid: agentData.userUid, title: 'Cash Withdrawal', description: `Hey padi, you have a new cash withdrawal request from  @${username}.`, redirectTo: 'Depositupdate'})

                        eventEmitter.emit('createRequest', {email: agentData.email, message: agentMessage})

        
                        return res.status(201).json({
                            status: true,
                            data: {
                                amount,
                                agent,
                                "message": "Hey padi, Cash request created successfully"
                            },
                            message: "success"
                        }) 
                            
                    }).catch((error) => {
                        logger.info(error)
                        return res.status(404).json({
                            status: false,
                            data : error,
                            message: "Aww padi, Cannot create data"
                        })
                    })
                } else {
                    return res.status(403).json({
                        status: false,
                        data: {},
                        message: "Aww padi, your balance is not enough for this transaction"
                    })
                }
            }
        }
        
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
});

