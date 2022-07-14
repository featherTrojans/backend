const { resolveAccount, addAccount, withdrawFund } = require("../../services/").services;

exports.home = ( async (req, res) => {
//  data = await withdrawFund({account_code: 'RCP_48ewmqbor1558yr', amount: 2000, reference: "12768867878", narration: "Ezeko withdrawal"})
    return res.status(200).json({
        status : true,
        data: {},
        message: "Working Successfully"
    })
})

exports.docs = ( async (req, res) => {

    return res.redirect("https://documenter.getpostman.com/view/9190659/UzJLNvuW");
    
})