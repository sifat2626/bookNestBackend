const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	status: {
		type: String,
		enum: ['Pending', 'Shipped', 'Delivered'],
		default: 'Pending'
	},
	shippingAddress: {
		fullName: { type: String, required: true },
		addressLine1: { type: String, required: true },
		addressLine2: { type: String },
		city: { type: String, required: true },
		state: { type: String, required: true },
		postalCode: { type: String, required: true },
		country: { type: String, required: true }
	},
	paymentDetails: {
		paymentMethod: { type: String, required: true },
		transactionId: { type: String, required: true },
		paymentDate: { type: Date, required: true }
	},
	items: [{
		book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
		quantity: { type: Number, required: true }
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
