const { config } = require("../../config")
const { getCablePrices, getCableDetail } = require("../../services/middlewares/mobilenigService")
const {logger} = config

exports.getPricing = (async(req, res) => {
    try{
        const {package} = req.params
        let result = await getCablePrices(package)
        console.log(result)
        if ( result == false ) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `No prices for the ${package}`
            })
        } else {
            return res.status(200).json({
                status: true,
                data: result,
                message: "Successfully retrieved"
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


exports.getCableDetail = (async(req, res) => {
    try{
        
        const {package, decoderNo} = req.body
        let result = await getCableDetail({package, decoderNo})
        if ( result == false ) {
            return res.status(404).json({
                status: false,
                data: {},
                message: `Invalid package ${package}`
            })
        } else {
            return res.status(200).json({
                status: true,
                data: result,
                message: "Successfully retrieved"
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