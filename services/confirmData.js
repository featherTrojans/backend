const Users = require("../models/User")

const confirmData = async (data) => {
    
    switch(data.type) {
        case "email" : return await Users.findOne({attributes: ['email', 'isVerified'], where: {email: data.data}});
        case "username" : return await Users.findOne({where: {username: data.data}});
        case "phoneNumber" : return await Users.findOne({attributes: ['phoneNumber', 'isVerified'], where: {phoneNumber: data.data}}); 
        default: return null;
    }
}

module.exports = confirmData