
const { config } = require('../config')
const logger = config.logger
const eventEmitter = config.eventEmitter
const nodemailer = require("nodemailer");


eventEmitter.addListener('signup', async (data) => {
    //send email


 try{

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'featherafrica',
        pass: 'Feather@2022'
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Feather Africa" <info@feather.africa>', // sender address
    to: (data.email).toLowerCase(), // list of receivers
    subject: "Confirmation Code", // Subject line
    text: data.message, // plain text body
    html: `<b>${data.message}</b>`, // html body
  });

  logger.info(`email code: ${data.code} sent`);
  // logger.info("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
 } catch( error ){

    logger.info('error')
     logger.info(error)

 };

})

eventEmitter.addListener('signupSuccess', async () => {
    //send email
    logger.info(`Signup success email sent`);
})