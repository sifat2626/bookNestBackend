const mongoose = require('mongoose');

const writerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	biography: {
		type: String,
		required: true
	},
	photo: {
		type: String, // Store the Cloudinary URL as a string
	},
	cphoto:{
		type:String,
		default:"https://i.postimg.cc/SxN3MBcH/not-found.png"
	},


});

const Writer = mongoose.model('Writer', writerSchema);

module.exports = Writer;
