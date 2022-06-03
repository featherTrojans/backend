var {firebaseApp} = require('../../config').config
const uuid = require('uuid-v4');

// CHANGE: The path to your service account


var bucket = firebaseApp.storage().bucket();



exports.uploadFile = async (data) => {
    try {
        var filename = data.file
        const metadata = {
            metadata: {
            // This line is very important. It's to create a download token.
            firebaseStorageDownloadTokens: uuid()
            },
            contentType: 'image',
            cacheControl: 'public, max-age=31536000',
        };

        // Uploads a local file to the bucket
        const uploadFile = await bucket.upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            metadata: metadata,
        });

        console.log(`${filename} uploaded.`);
        console.log(uploadFile[0].metadata)
        return uploadFile[0].metadata.mediaLink

    } catch (err) {
        logger.info(err)
        return false;
    }
    
}

// uploadFile().catch(console.error);