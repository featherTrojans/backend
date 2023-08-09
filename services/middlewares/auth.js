const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const logger = config.logger



const Authenticate = ((req, res, next) =>{
    
    
    try
    {
        const token = req.headers['token']?? (req.headers['authorization']).substr(7, (req.headers['authorization']).length - 7);
        logger.info('token', token);

    if (!token){

        return res.status(403).json({
            status: false,
            data: {},
            message: "Hey padi, this request is Unauthorized"
        })
    }
        const decoded = jwt.verify(token, config.jwt_secret)
        req.user = decoded
        req.token = token

    } catch (err) {

        logger.info('err', err)
        return res.status(401).json({
            status: false,
            data: err,
            message: "Hey padi, you cannot do this at the moment, kindly try again or contact support"
        })
    }
    return next();
});


module.exports = Authenticate
