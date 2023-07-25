const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	book: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Book',
		required: true
	},
	content: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
