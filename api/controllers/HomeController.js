const services = require("../../services").services
exports.home = ( async (req, res) => {
    // let banks = await services.listBanks()
    let banks = await services.initializeTransaction()
    return res.status(200).json({
        status : true,
        data: banks,
        message: "Working Successfully"
    })
})