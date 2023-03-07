const { config } = require("../../config");
const { Users } = require("../../models");
const logger = config.logger

exports.allEmails = ( async (req, res) => {

    try
    {
        const users = await Users.findAll({

            attributes: ['username', 'email', 'phoneNumber', 'fullName'],
            order: [['createdAt', 'DESC']],
        })
        
        

        return res.status(200).json({
            status: true,
            data : {

                users

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