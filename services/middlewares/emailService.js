const nodemailer = require("nodemailer");
const sgMail =  require("@sendgrid/mail");
const { config } = require("../../config");
const { logger, gmail_address, clientSecret, mail_from_name, clientId } = config;


const sendEmail = async (data) => {
    try {


        // sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Add API key
        // const msg = {
        // to: (data.email).toLowerCase(),
        // from: `${mail_from_name} <info@feather.africa>`, // Use the email address or domain you verified above
        // subject: data.subject,
        // text: data.message,
        // html: `<strong>${data.message}</strong>`,
        // };

        // sgMail
        // .send(msg)
        // .then((res) => {
        //     // mail sent  
        //     console.log(res)
        // }, error => {
        //     console.error(error);

        //     if (error.response) {
        //     console.error(error.response.body)
        //     }
        // });
        // create reusable transporter object using the default SMTP transport

        let transporter = nodemailer.createTransport({
            
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: gmail_address,
                clientSecret,
                clientId,
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