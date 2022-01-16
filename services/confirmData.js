const Users = require("../models/Users")

const confirmData = async (data) => {
    
    switch(data.type) {
        case "email" : return await Users.findOne({attributes: ['email'], where: {email: data.data}});
        case "username" : return await Users.findOne({attributes: ['username', 'password'], where: {username: data.data}});
        case "phoneNumber" : return await Users.findOne({attributes: ['phoneNumber'], where: {phoneNumber: data.data}}); 
        default: return null;
    }
}

module.exports = confirmData