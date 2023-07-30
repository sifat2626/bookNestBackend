const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	photo: {
		type: String, // Store the Cloudinary URL as a string
	},
	cphoto:{
		type:String,
		default:"https://i.postimg.cc/SxN3MBcH/not-found.png"
	},

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
