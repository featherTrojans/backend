const { config } = require("../../config");
const {confirmData} = require('../../services/').services

const logger = config.logger
exports.getUser = ( async (req, res) => {

    const { username } = req.params
    try
    {
        const users = await  confirmData({type: 'username', data: username});
        if (users == null) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `User ${username} does not exist`
            })
        }else {
            return res.status(200).json({
                status: true,
                data : {
                    user_id: users.user_Uid,
                    username: users.username,
                    fullName: users.fullName,
                    phoneNumber: users.phoneNumber,
                    email: users.email,
                    isVerified: users.isVerified,
                    userLevel: users.userLevel

                },
                message: "success"
            })
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