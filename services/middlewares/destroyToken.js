const { config } = require("../../config")
const logger = config.logger
const jwt = require('jsonwebtoken')

const destroyToken = (token) => {
    try{
        jwt.sign(token, config.jwt_secret, {
            expiresIn: "1h ago"
        })
    } catch (err) {
        logger.info(err)
        return null;
    }
}
module.exports = destroyToken