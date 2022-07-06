const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services')
const {awsService, googleService, cloudServices} = services
var formidable = require('formidable')

exports.uploadImages = (async (req, res) => {
    const errors = validationResult(req);
    const {userId} = req.user

    try{

        var form = new formidable.IncomingForm();
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!form ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "file is required"
            })
        } else {

            form.parse(req, function(err, fields, files) {
                if (err) {
          
                  // Check for and handle any errors here.
          
                  console.error(err.message);
                  return;
                } else {
                    const {name} = fields
                    const {size, path, type} = files.file

                    if ( size > 2000000){
                        return res.status(400).json({
                            status: false,
                            data: {},
                            message: "File cannot be greater than 2MB"
                        })
                    }else if ((type.split("/"))[1] !== 'jpeg' && (type.split("/"))[1] !== 'jpg' && (type.split("/"))[1] !== 'png' ) {
                        return res.status(400).json({
                            status: false,
                            data: {},
                            message: "Unsupported format, Only images can be uploaded"
                        })
                    } else {
                        cloudServices({file: path, name, ext: (type.split("/"))[1], userId})
                        .then(resp => {
                            console.log(resp)
                            return res.status(202).json({
                                    status: true,
                                    data: {},
                                    message: `${name} uploaded successfully`
                                })
                        })
                        .catch(err => res.status(500).json({
                            status: false,
                            data: {},
                            message: `Could not upload ${name}`
                        })  )

                        // if (uploaded) {
                        //     return res.status(202).json({
                        //         status: true,
                        //         data: {},
                        //         message: `${name} uploaded successfully`
                        //     })
                        // }
                    }
                }
              });
            
            }


    } catch (error) {
        logger.info(error)
        return res.status(409).json({
            status: false,
            data : error,
            message: "error occur"
        })
    }
})