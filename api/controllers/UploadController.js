const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services')
const {awsService} = services
var formidable = require('formidable')

exports.uploadImages = ((req, res) => {
    let { file } = req.body
    console.log(req.form)
    const errors = validationResult(req);

    try{
        var form = new formidable.IncomingForm();

        console.log(form)
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
                    console.log(files);
                    return
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