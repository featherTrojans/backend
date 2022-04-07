const { config } = require('../config');
const {Notification, Users } = require('../models/');
const idGenerator = require('../services/generateId');
const { logger, eventEmitter, fcm } = config;



eventEmitter.addListener('notification', async (data) => {
    
//send email

 try{
    let userUid, title, description, reference;
      userUid = data.userUid;
      title = data.title;
      description = data.description;
      reference = 'FTHRNTF' + idGenerator(8)

      const {messageToken} = await Users.findOne({
        where: {userUid},
        attributes: ['messageToken']
    })
    await Notification.create({
        userUid, title, description, reference})
     
    //send push notification
    const message = {
        to: messageToken,
        collapse_key: 'FTHR',
        notification: {
            title: data.title,
            body: data.description,
            delivery_receipt_requested: true,
        },
        data: {
            message: data.description
        }
    }
    fcm.send(message, (err, result) => {
        if ( err) {
            logger.info(`error: ${err}`)
        } else {
            logger.info(`result ${result}`)
        }


    })

    logger.info(`notification logged`);
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})

