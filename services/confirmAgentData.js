const Agents = require("../models/Agent");

const confirmAgentData = async (data) => {
    
    switch(data.type) {
        case "email" : return await Agents.findOne({attributes: ['email', 'isVerified'], where: {email: data.data}});
        case "username" : return await Agents.findOne({where: {username: data.data}});
        case "phoneNumber" : return await Agents.findOne({attributes: ['phoneNumber', 'isVerified'], where: {phoneNumber: data.data}});
        case "bus_name" : return await Agents.findOne({where: {business_name: data.data}});
        case "b_phoneNumber" : return await Agents.findOne({attributes: ['phoneNumber', 'isVerified'], where: {bus_phone_number: data.data}}); 
        default: return null;
    }
}

module.exports = confirmAgentData