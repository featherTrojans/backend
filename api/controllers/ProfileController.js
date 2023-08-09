const { Users } = require("../../models")


exports.createProfile = ( async (req, res) => {
    try {
        let { firstName, lastName, email, gender} = req.body
        let {userId } = req.user
        let {token} = req.token
        //find user
        userCheck = await Users.findOne({where: {userUid: userId}})
        if (userCheck == null ) {
            //return error
        } else {
            fullName = lastName + ' ' + firstName
            //update data
            Users.update({
                fullName,
                email,
                gender
            }, {where: {userUid: userId}})
            return res.status(200).json({
                status: true,
                data: {
                    userId,
                    token
                },
                message: "Hey padi, Your data has been successfully updated"
            })
        }
    } catch (error) {
        console.log('error', error)
        return res.status(409).json({
            status: false,
            data: {},
            message: "Aww padi,An error occured. Contact support"
        })
    }
})