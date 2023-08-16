const { config } = require("../../config")
const { NairaToUsd } = require("../../models")
const {logger} = config

exports.getRate =  (async (req, res) => {
    try{
        // get rate 
        let rates = await NairaToUsd.findAll({
            order: [['createdAt', 'DESC']],
            limit: 1
        })
        if (rates != null ) {
            let { rate, buyingRate} = rates[0]
            return res.status(200).json({
                staus: true,
                data: {
                    "weBuyAt": rate, 
                    "userSellAt": buyingRate,
                    "denomination": "naira"
                },
                message: "Data retieved"
            })
        } else {
            return res.status(404).json({
                staus: false,
                data: {},
                message: "Rate cannot be found"
            })
        }
    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occured"
        })
    }
})