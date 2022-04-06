const { config } = require('../config');
const {Notification } = require('../models/');
const idGenerator = require('../services/generateId');
const { logger, eventEmitter } = config;



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

    logger.info(`notification logged`);
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})

