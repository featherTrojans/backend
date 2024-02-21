
const { CardHistory, CardPayments } = require("../../models")

exports.handleTransaction = (async(data) => {
    const {reference, description, amount, type } = data
    let lastCheck = await CardPayments.findAll({
        order: [['createdAt', 'DESC']],
        limit: 1,
    })
    console.log('lenght', lastCheck.length)
    initBal = lastCheck == null || lastCheck.length == 0 ? 0 : lastCheck[0].amount
    console.log('iniyBal', initBal)
    finalBal = type == 'add' ? Math.round((initBal + amount), 2) : Math.round((initBal - amount), 2)

    //update
    lastCheck == null || lastCheck.length == 0 ? CardPayments.create({
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
        initial_bal: initBal,
        final_bal: finalBal,
        amount,
        reference,
        description

    })
})