const { config } = require('../config');
const {Notification, Users } = require('../models/');
const idGenerator = require('../services/generateId');
const { logger, eventEmitter, firebaseApp } = config;



eventEmitter.addListener('notification', async (data) => {
    
//send email

 try{
    let userUid, title, description, reference;
      userUid = data.userUid;
      title = data.title;
      description = data.description;
      reference = 'FTHRNTF' + idGenerator(8)

    await Notification.create({
        userUid, title, description, reference})

    //send push notification
    const topic = 'general';
    const message = {
        notification: {
            title: data.title,
            body: data.description,
        },
        topic
    }

    firebaseApp.messaging().send(message).then((res)=> {
        console.log(res)
    }).catch((err)=> {
        logger.info(err)
    })

    logger.info(`notification logged`);
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})

