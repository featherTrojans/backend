const { Users } = require("../../models")
const { config } = require("../../config");
const { validationResult } = require('express-validator');
const {logger} = config;
const {services} = require('../../services')
const {cloudServices} = services
var formidable = require('formidable');

exports.veteranUpgrade = (async( req, res)=> {
    const {userId} = req.user
    var form = new formidable.IncomingForm();
    try {
        const errors = validationResult(req);
        //check user
        let userCheck = await Users.findOne({
            where: {userUid: userId}
        })
        if (userCheck == null) {
            return res.status(404).json({
                status: false,
                data : {},
                message: "Hey padi, you don't have access to this operation"
              })
        } else if (userCheck.UserLevels < 2) {
            return res.status(403).json({
                status: false,
                data : {},
                message: "Hey padi, you are not authorized to perform this operation"
              })
        } else {
        if (!errors.isEmpty()) {

            return res.status(403).json({ errors: errors.array() });
  
        }else if (!form ) {
            return res.status(400).json({
                status: false,
                data: {},
                message: "Hey padi, kindly upload data"
            })
        } else {

            form.parse(req, function(err, fields, id_image) {
                if (err) {
          
                  // Check for and handle any errors here.
          
                  console.error(err.message);
                  return res.status(400).json({
                      status: false,
                      data: err.message,
                      messgae: "Hi padi, an error occurred"
                  });
                } else {
                    const {address, city, state, country, postal_code, house_no, id_type,id_no} = fields
                    // console.log(id_image.id_image)
                    if (id_image != null ) {
                        const {size, path, type} = id_image.id_image

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
                            cloudServices({file: path, name: 'id_image', ext: (type.split("/"))[1], userId, uploadType: "id"})
                            .then(resp => {
                                console.log('image url', resp)
                                //update data
                                Users.update({
                                    address, city, state, country, postalCode: postal_code, 
                                    houseNo: house_no, 
                                    id_type, id_no,
                                    userLevel: 4,
                                }, {
                                    where: {
                                        userUid: userId
                                    }
                                })

                                return res.status(202).json({
                                        status: true,
                                        data: {},
                                        message: `Hey padi, your veteran upgrade has been successful. You now enjoy our unlimited services`
                                    })
                            })
                            .catch(err => res.status(500).json({
                                status: false,
                                data: {},
                                message: `Could not upload ${id_image}`
                            })  )

                        }
                   }  else {
                        return res.status(400).json({
                            status: false,
                            data: {},
                            message: "No file uploaded"
                        })
                   }  
                }
              });
            
            }
        }
    } catch  (error) {
        console.log('error', error)
        return res.status(409).json({
        status: false,
        data : error,
        message: "error occurred"
        })
    }
})