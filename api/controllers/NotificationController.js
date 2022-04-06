const { config } = require("../../config");
const { Notification, Users } = require("../../models");
const {logger} = config

exports.notifications = ( async (req, res) => {

    const { userId } = req.user
    try
    {
        // let results = []
        const notifications = await Notification.findAll({

            attributes: ['userUid', 'title', 'description', 'isRead','createdAt'],
            where: {userUid: userId},
            order: [['createdAt', 'DESC']],
            limit: [20]
            // include: [{
            //     model: Users,
            //     attributes: ['fullName', 'imageUrl'],
                
            //    }]
        })
        // let otherUser;
        // for (const [key, value] of Object.entries(notifications)){

        //     //get agentDetails
        //     if (value.dataValues.direction == 'out') {
        //         otherUser = await Users.findOne({
        //             where: {username: value.dataValues.to},
        //             attributes: ['fullName', 'imageUrl']
        //         })
        //     } else if (value.dataValues.direction == 'in') {
        //         otherUser = await Users.findOne({
        //             where: {username: value.dataValues.from},
        //             attributes: ['fullName', 'imageUrl']
        //         })
        //     }

        //     if ( otherUser != null ){
        //         value.dataValues.otherUser = otherUser
        //         results.push(value.dataValues)
        //     } else {
        //         results.push(value.dataValues)
        //     }



        // }

        return res.status(200).json({
            status: true,
            data : {

                notifications

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