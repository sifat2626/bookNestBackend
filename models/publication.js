const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
	name: {
		type: String,
		unique:true,
		required: true,
		trim: true
	},
	location:{
		type:String,
	}

});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
