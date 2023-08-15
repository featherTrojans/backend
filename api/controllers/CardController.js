const {createCardHolder, getCardDetails, fundCard, idGenService, debitService} = require('../../services').services
const {Users, BVN, Card, NairaToUsd} = require('../../models')
var formidable = require('formidable');

exports.createUserCard = (async (req, res) => {
    try {
      const { userId } = req.user

        let usersData = await Users.findOne({
          where: {userUid: userId}
        })


    if (usersData.userLevel > 2 ) {
      fullName = usersData.fullName.split(' ');
      first_name = fullName[1]
      last_name = fullName[0]
      phone = usersData.phoneNumber
      email_address = usersData.email
      const {bvn} = await BVN.findOne({
        where: {userUid: userId}
      })
      address = {
        "address": usersData.address,
        "city": usersData.city,
        "state": usersData.state,
        "country": usersData.country,
        "postal_code": usersData.postalCode,
        "house_no": usersData.houseNo
      }
      identity = {
        "id_type": usersData.id_type,
        "id_no": usersData.id_no,
        "id_image": usersData.id_image
      }

      //if all data are complete create holder
      let cardResponse = await createCardHolder({
        userUid: userId,
        first_name,
        last_name,
        address,
        phone,
        email_address,
        identity,
        bvn
      })

      console.log('cardResponse', cardResponse)
      return res.status(cardResponse.statusCode).json(
        cardResponse.other
      )

    } else {
      return res.status(403).json({
        status: false,
        data: {},
        message: "Unauthorized operation",
      })
    }
      

    } catch (error) {
      console.log(error)
      return res.status(409).json({
        status: false,
        data : error,
        message: "error occurred"
    })
    }
    
})

exports.getCardDetails = ( async ( req, res) => {
   try {
      const { userId } = req.user
      //find details
      let userDetail = await Card.findOne({ where: {userUid: userId}})
      if (userDetail == null ){
        return res.status(404).json({
          status: false,
          data : {},
          message: "User does not have a card"
        })
      } else {
          let cardDetail = await getCardDetails({card_id: userDetail.card_id})
          return res.status(cardDetail.statusCode).json(cardDetail.other)
      }
   } catch  (error) {

      return res.status(409).json({
        status: false,
        data : error,
        message: "error occurred"
      })
   }
})

exports.fundCard = (async (req, res) => {
  try{
    const { userId } = req.user
    const { amountUsd, amountNaira } = req.body
    if ( amountUsd > 200 ) {
      return res.status(400).json({
        status: false,
        data : {},
        message: "Hey padi, you have entered an amount greater than stipulated "
      })
    } else if (amountUsd < 0 ) {
      return res.status(400).json({
        status: false,
        data : {},
        message: "Hey padi, you have entered an invalid amount"
      })
    } else {
      let user = await Users.findOne({
        where: {userUid: userId}
      })

      if (user !== null ) {
        let cardDetail = await Card.findOne({ where: {userUid: userId}})

        if ( cardDetail != null ) {

            const usdRate = await NairaToUsd.findAll({
              order: [['createdAt', 'DESC']],
              limit: 1,
            })
            let {rate} = usdRate[0]
            let amount = Math.round((rate * (amountUsd + 1)), 2)

            if ( amount > user.walletBal) {
              return res.status(400).json({
                status: false,
                data : {},
                message: "Hey padi, you do not have enough balance"
              })
            } else {
              //debit naira and credit card
              await debitService({userUid: userId, reference:ref, amount, description: `NGN${amount} for $ ${amountUsd} card funding  `, from: 'primary wallet', to: 'USD card', title: "Card Funding", charges: "$1"})
              console.log("rate", usdRate)
              ref = idGenService(15)
              let fundRes = fundCard({
                  "card_id": cardDetail.card_id,
                  "amount": amountUsd,
                  "transaction_reference": ref,
                  "currency": "USD"
                })

                return res.status(fundRes.statusCode).json(fundRes.other)
            }
          
        } else {
          return res.status(400).json({
            status: false,
            data : {},
            message: "Hey padi, you do not  have a card"
          })
        }
        
      } else {
        return res.status(404).json({
          status: false,
          data : {},
          message: "Hey padi, you can't fund this card at the moment"
        })
      }
      

    }
    
  } catch  (error) {
    console.log('error', error)
    return res.status(409).json({
      status: false,
      data : error,
      message: "error occurred"
    })
 }
})