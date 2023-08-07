const multer = require('multer');

const { cloudinary } = require('../utils/cloudinary');
const { upload } = require("../utils/multer");

exports.uploadImage = async (req, res, next) => {

    let cloudinaryResponse;

    if (req.file) {

        cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
            use_filename: true, // use original filename
            folder: 'bookshop', // folder name in cloudinary
        });
        console.log('cloudinaryResponse: ', cloudinaryResponse);
    } else {
        return res.status(500).json({error: 'No file was uploaded'});
    }

    res.status(200).json({
        image: cloudinaryResponse?.secure_url,
    });
};
