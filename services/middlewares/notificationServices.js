const { Users } = require("../../models")
const {logger, Op, eventEmitter} = require("../../config").config
require('../../subscribers')


exports.notificationService = async({type, message, kind, subject}) => {
    
    levelToUse = kind == 'all'  ? {[Op.gte]: 0} : kind == 'odogwu' ? 2 : kind == 'agent' ? 3 : kind == 'starter' ? 1 :  {[Op.gte]: 1}
    const users = await Users.findAll({
       attributes: ['email', 'messageToken', 'phoneNumber'],
       where: {userLevel: levelToUse}
    })
    // logger.info(users)
    for (const [key, value] of Object.entries(users)){
        const data = value.dataValues
        if (type == 'email') {
            //send email
            var email = data.email
            eventEmitter.emit('extraEmail', {subject, email, message})
        } else if (type == 'sms') {
            var phoneNumber = data.phoneNumber;
            // console.log(number)
            eventEmitter.emit('extraSms', {phoneNumber, message})
        } else if ( type == 'push') {
            var messageToken = data.messageToken
            // console.log(token)
            eventEmitter.emit('extraNotif', {messageToken, title: subject, description: message})
        }
    }

}

// notificationService({type: 'sms', message: "test message", kind: "conventional", subject: 'test test'})