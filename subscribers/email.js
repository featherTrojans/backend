const { config } = require('../config');
const sendEmail = require('../services/middlewares/emailService')
const { logger, eventEmitter } = config;



eventEmitter.addListener('signup', async (data) => {
    
//send email

 try{
    let email, subject, message;
      email = data.email;
      message = data.message;
      subject = 'Confirmation Code';

    await sendEmail({email, subject, message})
    logger.info(`email code: ${data.code} sent`);
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})

eventEmitter.addListener('signupSuccess', async (data) => {
    //send email
    let email, subject, message;
    email = data.email;
    message = data.message;
    subject = 'Welcome To Feather';

  await sendEmail({email, subject, message})
    logger.info(`Signup success email sent`);
})

eventEmitter.addListener('walletDebit', async (data) => {
  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Feather';

  await sendEmail({email, subject, message})
  logger.info(`Wallet debited`);
})

eventEmitter.addListener('walletCredit', async (data) => {
  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Feather';

  await sendEmail({email, subject, message})
  logger.info(`Wallet credited`);
})