
const { CardHistory, CardPayments } = require("../../models")

exports.handleTransaction = (async(data) => {
    const {reference, description, amount, type } = data
    let lastCheck = await CardPayments.findAll({
        order: [['createdAt', 'DESC']],
        limit: 1,
    })

    initBal = lastCheck == null ? 0 : lastCheck[0].amount
    finalBal = type == 'add' ? Math.round((initBal + amount), 2) : Math.round((initBal - amount), 2)

    //update
    lastCheck == null ? CardPayments.create({
        name: "cardAccount",
        amount: finalBal
    }) : CardPayments.update({
        amount: finalBal
    }, {where: {
        name: "cardAccount"
    }})

    //create history
    CardHistory.create({
        name: "cardAccount",
        inital_bal: initBal,
        final_bal: finalBal,
        reference,
        description

    })
})