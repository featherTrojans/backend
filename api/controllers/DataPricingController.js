const { pricing } = require("../../services/middlewares/mobilenigService")

exports.getDataPrices = (async(req, res) => {
    const {network} = req.params

    pricing({service_id, requestType: 'SME'})

})