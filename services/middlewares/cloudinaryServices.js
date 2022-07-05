const cloudinary = require('cloudinary').v2
const {config} = require('../../config')
const {cloud_api_key, cloud_api_secret, cloud_name} = config   
exports.uploadFile = async (data) => {
    await cloudinary.uploader.upload(data.file, { 
        cloud_name, 
        api_key: cloud_api_key, 
        api_secret: cloud_api_secret,
        secure: true,
        resource_type: "auto", public_id: "feather/" + data.name,
        overwrite: true,
      }
, function(error, result) {
        if (error) {
            console.log('error', error)
            return false
        } else {
            console.log('result', result.secure_url)
            return result.secure_url
        }

    });
}