const { resolveAccount, addAccount, withdrawFund } = require("../../services/").services;

exports.home = ( async (req, res) => {
    return res.status(200).json({
        status : true,
        data: {},
        message: "Working Successfully"
    })
})

exports.docs = ( async (req, res) => {

    return res.redirect("https://documenter.getpostman.com/view/9190659/UzJLNvuW");
    
})