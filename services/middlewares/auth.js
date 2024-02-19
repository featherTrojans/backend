const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const { BlackListedTokens } = require('../../models');
const logger = config.logger



const Authenticate = (async (req, res, next) =>{
    
    
    try
    {
        const token = req.headers['token']?? (req.headers['authorization']).substr(7, (req.headers['authorization']).length - 7);
        logger.info('token', token);
        // checkToken = await BlackListedTokens.find({
        //     where: {
        //         token
        //     }
        // })
    
        // console.log('checkToken', checkToken)
    if (!token){

        return res.status(403).json({
            status: false,
            data: {},
            message: "Hey padi, this request is Unauthorized"
        })
    } else {
        let checkToken = await BlackListedTokens.findOne({
            where: {
                token
            }
        })
        if (checkToken != null) {
            return res.status(419).json({
                status: false,
                data: {},
                message: "Hey padi, this request is Unauthorized"
            })
        }
        const decoded = jwt.verify(token, config.jwt_secret)
        req.user = decoded
        req.token = token
    }
    

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
