const AWS = require('aws-sdk');
const {config} = require('../../config/')
const fs = require('fs')
const {aws_secret, aws_access, logger} = config


const s3 = new AWS.S3({
  accessKeyId: aws_access,
  secretAccessKey: aws_secret
});

exports.uploadFile = async (data) => {

    try {

        AWS.config.update({region: 'us-east-1'});

        let imagePath = data.file;
        const blob = await fs.readFileSync(imagePath)
        const params = {
            Bucket: 'featherimages',
            Key: 'users/' + data.name + '.' + data.ext,
            Body: blob,
          }
        // const uploadedImage = await s3.upload().promise()
    
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