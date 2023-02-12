
const sgMail =  require("@sendgrid/mail");
const { config } = require("../../config");
const { logger, mail_from_name, sendgrid_api_key } = config;


const sendEmail = async (data) => {
    try {
        

        if (data.email !== null) {   
            sgMail.setApiKey(sendgrid_api_key); // Add API key
            const msg = {
            to: (data.email).toLowerCase(),
            from: `${mail_from_name} <padi@feather.africa>`, // Use the email address or domain you verified above
            subject: data.subject,
            text: data.message,
            html: `<strong>${data.message}</strong>`,
            };

            sgMail
            .send(msg)
            .then((res) => {
                // mail sent  
                console.log(res)
            }, error => {
                console.error(error);

                if (error.response) {
                console.error(error.response.body)
                }
            });
            
            return "email sent";
        } else {
            return 'user does not have email attached'
        }
    } catch ( error ) {
        logger.info(error);
        return "email not sent"
    }
}

module.exports = sendEmail