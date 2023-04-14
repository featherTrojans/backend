const { config } = require("../../config");
const { Request, Users } = require("../../models");
const {logger, eventEmitter} = config
const idGenService = require("../generateId");
const timeService = require("./timeservice")
require('../../subscribers')


 exports.createRequest = ( async (data) => {
    
    const { userUid, username, email, amount, charges, agent, agentUsername, statusId, meetupPoint, negotiatedFee  , transId} = data


    try
    {
        if (timeService.serverTime().now >= "02:00" && timeService.serverTime().now < "05:01") {
            return ({
                code: 400,
                status : false,
                data: {},
                message: "Aw Padi!! Cash requests are not available during this period, try again later!!!"
            })
        } else if (!(amount || charges || agent || agentUsername || statusId || meetupPoint)) {
            return ({
                code: 400,
                status : false,
                data: {},
                message: "Aww padi! Something occurred; please try again later"
            })
        } else if (amount < 200 ) {
            return ({
                code: 400,
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
                return ({
                    code: 400,
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
                    
                    await Request.create({

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
                        status: 'APPROVED',
                        negotiatedFee: negotiatedFee ? negotiatedFee : 0
        
                    })

                    const message = `Dear @${username}, you have a new cash withdrawal`;
                    eventEmitter.emit('createRequest', {email, message})
                    eventEmitter.emit('notification', {userUid, title: 'Cash Withdrawal', description: 'Hey padi, your cash request has been successfully created', redirectTo: 'Withdraw'})

    
                    return ({
                        code: 201,
                        status: true,
                        data: {
                            amount,
                            agent,
                            "message": "Hey padi, Cash request created successfully"
                        },
                        message: "success"
                    }) 
                            
                    
                } else {
                    return ({
                        code: 403,
                        status: false,
                        data: {},
                        message: "Aww padi, your balance is not enough for this transaction"
                    })
                }
            }
        }
        
    } catch (error) {
        logger.info(error)
        return ({
            code: 409,
            status: false,
            data : error,
            message: "error occur"
        })
    }
});

