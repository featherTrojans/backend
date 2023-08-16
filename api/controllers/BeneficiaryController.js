const { config } = require("../../config")
const {Beneficiary, Users} = require("../../models")
const {logger } = config
exports.createBeneficiary = (async (req, res) => {
    try{
        const {type, data} = req.body
        const {userId} = req.user
        const check = await Users.findOne({
            where: {
                userUid: userId
            }
        })
        if (check == null) {
            return res.status(403).json({
                status: false,
                data: {},
                message: "Hey padi, you are not authorized to perform this operation"
            })
        } else {
            await Beneficiary.create({
                userUid: userId,
                data: JSON.stringify(data),
                beneficiary_type: type
            })
            let beneficiaries = await Beneficiary.findAll({
                where: {
                    userUid: userId,
                    beneficiary_type: type
                }
            })
            return res.status(201).json({
                status: true,
                data: {beneficiaries},
                message: `${data} added to beneficiary type ${type} successfully`
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
})

exports.getBeneficiary = (async (req, res) => {
    try{
        const {userId} = req.user
        const {type} = req.body
        let beneficiaries = await Beneficiary.findAll({
            where: {
                userUid: userId,
                beneficiary_type: type
            }
        })

        if ( beneficiaries != null ) {
            return res.status(200).json({
                status: true,
                data: {beneficiaries},
                message: "Successfully retrieved"
            })
        } else {
            return res.status(404).json({
                status: false,
                data: {},
                message: `Hey padi, no beneficiary found for type ${type}`
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
})