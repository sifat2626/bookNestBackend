const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	status: {
		type: String,
		enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
		default: 'Pending'
	},
	orderDetails: { type: {}, required: true},
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
