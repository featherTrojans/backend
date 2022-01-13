const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const logger = config.logger



const Authenticate = ((req, res, next) =>{
    const token = req.headers['token'];
    logger.info(token)

    if (!token){

        return res.status(403).json({
            status: false,
            data: {},
            message: "Unauthorized request"
        })
    }
    try
    {
        const decoded = jwt.verify(token, config.jwt_secret)
        req.user = decoded

    } catch (err) {

        logger.info(err)
        return res.status(401).json({
            status: false,
            data: {},
            message: "Token not valid"
        })
    }
    return next();
});


module.exports = Authenticate
