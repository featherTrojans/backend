

const destroyToken = async (token) => {
    try{
      
       await BlackListedTokens.create(
           token
       )
    } catch (err) {
        logger.info(err)
        return null;
    }
}
module.exports = destroyToken