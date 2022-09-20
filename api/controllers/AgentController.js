const { Agent, Users } = require("../../models");
const {logger, eventEmitter} = require("../../config").config
const { validationResult } = require('express-validator')
const {services} = require("../../services")
require('../../subscribers')

exports.signup = ( async (req, res) => {

    try
    {
        const {business_name, daily_transaction, operating_states, full_address, phone_number} = req.body
        const {userId} = req.user
        const errors = validationResult(req);
        const agentId = 'AGT' + services.idGenService(10)
        
        if (!errors.isEmpty()) {

          return res.status(403).json({ errors: errors.array() });

        } else {


            if (!(phone_number && full_address && operating_states && daily_transaction && business_name)){

                return res.status(400).json({
                    status : false,
                    data: {},
                    message: "Oops padi, All input are required"
                })

            } else  {

                Agent.create({
                    userUid: userId,
                    business_name,
                    daily_transaction,
                    operating_states,
                    full_address,
                    phone_number,
                    agentId
                }).then( () => {

                    return res.status(201).json({
                        status : true,
                        data: {},
                        message: "Hey Padi, your request to be an agent is successful"
                    })

                }).catch((error) => {

                    logger.info(error)
                    return res.status(400).json({
                        status : false,
                        data: error,
                        message: "Hey padi, something came up... Try again later!"
                    })

                })

            } 

        }

    }
    catch (error) {

        logger.info(error)
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }

})


exports.approve = (async (req, res) => {
    try{
        const {agentId} = req.body
        const check = Agent.findOne({
            where: {agentId},
            attributes: ['userUid', 'status', 'phone_number']
        })
        const {auth_token} = req.headers
        if (auth_token != 'FeatherAdmin2022@'){
            res.status(403).json({
                status: false,
                data: {},
                message: "This is an unauthorized request"
            })
        }else if (!check || check == null ) {
            return res.status(404).json({
                status: false,
                data: {},
                message: "Hey padi, the agent does not exist"
            })
        } else if (check.status != 'PENDING') {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hey padi, the request has been approved"
            })
        } else {
            // update agent
            Agent.update({status: "APPROVED"}, {where: {agentId}})
            const {email, messageToken, phoneNumber} = Users.findOne({where: {userUid}})
            //update userlevel
            Users.update({userLevel: 3}, {where: {userUid: check.userUid}})
            message = "Hey padi, your request to become an agent has been approved!!!";

            eventEmitter.emit('message', {code, phoneNumber, email, message, messageToken, title: "Agent Request Approved"});

            return res.status(200).json({
                status: true,
                data: {},
                message: "Request approved successfully"
            });
        }

    } catch (error) {

        logger.info(error);
        res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        });
    }
}) 