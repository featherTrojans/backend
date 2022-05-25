const AWS = require('aws-sdk');
const {config} = require('../../config/')
const {aws_secret, aws_access, logger} = config

const s3 = new AWS.S3({
  accessKeyId: aws_access,
  secretAccessKey: aws_secret
});

exports.uploadFile = (data) => {

    try {
        const params = {
            Bucket: 'feather',
            Key: `banks/${data.name}`,
            Body: data.file
        };
    
        s3.upload(params, function(err, data) {
            console.log(err, data);
            if ( err) {
                logger.info(err);
                return false
            }else {
                console.log(data)
                return true
            }
        });
    } catch (err) {
        logger.info(err);
        return false
    }
    
}