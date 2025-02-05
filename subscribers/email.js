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
eventEmitter.addListener('changePassword', async (data) => {
  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Password Changed';

await sendEmail({email, subject, message})
  logger.info(`password changed email sent`);
})

eventEmitter.addListener('changedPassword', async (data) => {
  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Password Changed';

await sendEmail({email, subject, message})
  logger.info(`password changed email sent`);
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

eventEmitter.addListener('createRequest', async (data) => {

  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Feather Cash Withdrawal Request';

  await sendEmail({email, subject, message})

})

eventEmitter.addListener('negotiateFee', async (data) => {

  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Feather Cash Withdrawal Request Negotiation';

  await sendEmail({email, subject, message})
  
})

eventEmitter.addListener('acceptRequest', async (data) => {

  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = 'Feather Cash Withdrawal Request';

  await sendEmail({email, subject, message})
  
})

eventEmitter.addListener('extraEmail', async (data) => {

  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = data.subject;

  await sendEmail({email, subject, message})
  
})

eventEmitter.addListener('message', async (data) => {

  //send email
  let email, subject, message;
  email = data.email;
  message = data.message;
  subject = data.subject;

  await sendEmail({email, subject, message})
  
})