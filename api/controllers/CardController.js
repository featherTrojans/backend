const {createCardHolder, getCardDetails} = require('../../services').services
const {Users, BVN, Card} = require('../../models')
var formidable = require('formidable');

exports.createUserCard = (async (req, res) => {
    try {
      const { userId } = req.user
      const {
          identity,
          address
        } = req.body

        console.log(identity)

        let usersData = await Users.findOne({
          where: {userUid: userId}
        })


    if (usersData.userLevel > 1 ) {
      fullName = usersData.fullName.split(' ');
      first_name = fullName[1]
      last_name = fullName[0]
      phone = usersData.phoneNumber
      email_address = usersData.email
      const {bvn} = await BVN.findOne({
        where: {userUid: userId}
      })
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
      return res.status(cardResponse.statusCode).json(
        cardResponse.other
      )

    } else {
      return res.status(403).json({
        status: false,
        data: {},
        message: "Unauthorized operation",
        body: req.body
      })
    }
      

    } catch (error) {
      return res.status(409).json({
        status: false,
        data : error,
        message: "error occur"
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
    const nairaToUsd = await NairaToUsd.findAll({
      order: [['createdAt', 'DESC']],
        limit: 1,
    })
  }catch  (error) {

    return res.status(409).json({
      status: false,
      data : error,
      message: "error occurred"
    })
 }
})