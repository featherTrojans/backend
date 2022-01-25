exports.home = ( async (req, res) => {
    // let banks = await services.listBanks()
    return res.status(200).json({
        status : true,
        data: {},
        message: "Working Successfully"
    })
})