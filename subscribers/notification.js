const { config } = require('../config');
const {Notification, Users } = require('../models/');
const idGenerator = require('../services/generateId');
const { logger, eventEmitter, fcm } = config;
const fetch = require('node-fetch');



eventEmitter.addListener('notification', async (data) => {
    
//send email

 try{
    let userUid, title, description, reference;
      userUid = data.userUid;
      title = data.title;
      description = data.description;
      reference = 'FTHRNTF' + idGenerator(8)

      const { messageToken } = await Users.findOne({
        where: {userUid},
        attributes: ['messageToken']
    })
    await Notification.create({
        userUid, title, description, reference})
     
    //send push notification
    const message = {
        to: messageToken,
        title: data.title,
        sound: "default",
        body: data.description,
        data: {
            title: data.title,
            body: data.description,
            redirectTo: data?.redirectTo ? data.redirectTo : 'Root'
        }
        
    }

    let fetchUrl =  await fetch("https://exp.host/--/api/v2/push/send", {
        method: 'POST',
        body: JSON.stringify(message),
    })
    fetchUrl = await fetchUrl.json()
    logger.info(` pushNotificationResult: `)
    logger.info(fetchUrl)
    // fcm.send(message, (err, result) => {
    //     if ( err) {
    //         logger.info(`error: ${err}`)
    //     } else {
    //         logger.info(`result ${result}`)
    //     }


    // })

    logger.info(`notification logged`);
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})


eventEmitter.addListener('extraNotif', async (data) => {
    
    //send email
    
     try{
          title = data.title;
          description = data.description;
          reference = 'FTHRNTF' + idGenerator(8)
          messageToken = data.messageToken
          const {userUid } = await Users.findOne({
            where: {messageToken},
            attributes: ['userUid']
        })
        await Notification.create({
            userUid, title, description, reference})
         
        //send push notification
        const message = {
            to: messageToken,
            title: data.title,
            sound: "default",
            body: data.description,
            data: {
                title: data.title,
                body: data.description,
                redirectTo: data?.redirectTo ? data.redirectTo : 'Root'
            }
            
        }
    
        let fetchUrl =  await fetch("https://exp.host/--/api/v2/push/send", {
            method: 'POST',
            body: JSON.stringify(message),
        })
        fetchUrl = await fetchUrl.json()
        logger.info(` pushNotificationResult: `)
        logger.info(fetchUrl)
        // fcm.send(message, (err, result) => {
        //     if ( err) {
        //         logger.info(`error: ${err}`)
        //     } else {
        //         logger.info(`result ${result}`)
        //     }
    
    
        // })
    
        logger.info(`notification logged`);
     } catch( error ){
    
        logger.info('error')
         logger.info(error)
    
     };
    
    })
