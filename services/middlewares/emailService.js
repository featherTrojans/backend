const nodemailer = require("nodemailer");
const { config } = require("../../config");
const { logger, gmail_address, gmail_password, mail_from_name } = config;


const sendEmail = async (data) => {
    try {

        // create reusable transporter object using the default SMTP transport

        let transporter = nodemailer.createTransport({
            
            service: 'gmail',
            auth: {
                user: gmail_address,
                pass: gmail_password
            }
          });
        
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: `${mail_from_name} <info@feather.africa>`, // sender address
            to: (data.email).toLowerCase(), // list of receivers
            subject: data.subject, // Subject line
            text: data.message, // plain text body
            html: `<b>${data.message}</b>`, // html body
          });
          
          return "email sent";
          // logger.info("Message sent: %s", info.messageId);
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        
          // Preview only available when sending through an Ethereal account
          // logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch ( error ) {
        logger.info(error);
        return "email not sent"
    }
}

module.exports = sendEmail