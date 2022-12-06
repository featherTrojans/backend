const { logger, Op } = require("../../config").config;
const { Users } = require("../../models");

exports.makeMarketer = ( async (req, res) => {

    const { user, refCode } = req.body
    const auth = req.headers['auth_token']


    try
    {
        if ( auth !== 'FeatherAdmin2022@'){
            return res.status(403).json({
                status: false,
                data: {},
                message: "Unauthorized request"
            })

        } else {

            const userToUse = await Users.findOne({
                where: {
                    [Op.or]: {
                        username: user,
                        phoneNumber: user,
                        userUid: user,
                    }
                },
                attributes: ['userUid', 'isMarketer', 'username']
            });
    
            if ( userToUse == null || userToUse.length == 0 ) {
                return res.status(404).json({
                    status: false,
                    data: {},
                    message: "User not found"
                })
            } else {
                if (!(userToUse.isMarketer)) {
                    const update = refCode !== null ? await Users.update({isMarketer: true, refId: refCode}, {where: {userUid: userToUse.userUid}}) : 'already a marketer'
                    return res.status(200).json({
                        status: true,
                        data : {
            
                        },
                        message: refCode !== null ? `${userToUse.username} has been made a marketer and assigned ref code: ${refCode}` : `${userToUse.username} is already a marketer`
                    })
                } else {
                    const update = refCode !== null ? await Users.update({isMarketer: true, refId: refCode}, {where: {userUid: userToUse.userUid}}) : await Users.update({isMarketer: true}, {where: {userUid: userToUse.userUid}})
                    
                    return res.status(200).json({
                        status: true,
                        data : {},
                        message: refCode !== null ? `${userToUse.username} has been made a marketer and assigned ref code: ${refCode}` : `${userToUse.username} has been made marketer`
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


exports.getMarketer = ( async (req, res) => {
    try
    {
        const marketers = await Users.findAll({
            where: {
                isMarketer: true
            },
            attributes: ['userUid', 'isMarketer', 'username', 'refId', 'fullName', 'phoneNumber']
        });

        if ( marketers == null || marketers.length == 0 ) {
            return res.status(404).json({
                status: false,
                data: {},
                message: "No marketer found"
            })
        } else {
                
            return res.status(200).json({
                status: true,
                data : marketers,
                message: 'success'
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
