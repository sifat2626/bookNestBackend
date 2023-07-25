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
	}


});

const Writer = mongoose.model('Writer', writerSchema);

module.exports = Writer;
