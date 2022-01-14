const { config } = require("../../config")
const logger = config.logger
const jwt = require('jsonwebtoken')

const TokenServices = (data = {}, duration ) => {
    try
    {
        const token = jwt.sign(data, config.jwt_secret,{
            expiresIn: duration
        })
        return token
    } catch (err) {
        logger.info(err)
        return null;
    }
}

module.exports = TokenServices