const AWS = require('aws-sdk');
const {config} = require('../../config/')
const {aws_secret, aws_access} = config

const s3 = new AWS.S3({
  accessKeyId: aws_access,
  secretAccessKey: aws_secret
});

exports.uploadFile = async (data) => {

    try {
        const params = {
            Bucket: 'feather',
            Key: 'banks',
            Body: data.file
        };
    
        await s3.upload(params, function(err, data) {
            console.log(err, data);
        });
    } catch (err) {
        logger.info(err);
        return false
    }
    
}