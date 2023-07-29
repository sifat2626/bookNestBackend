// controllers/order.js

const Order = require('../models/order');

// GET all orders
exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().populate('user', 'name email').populate('book', 'title price');
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving orders.' });
	}
};

// GET a specific order by ID
exports.getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id).populate('user', 'name email').populate('book', 'title price');
		if (!order) {
			return res.status(404).json({ message: 'Order not found.' });
		}
		res.json(order);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving the order.' });
	}
};

// CREATE a new order
exports.createOrder = async (req, res) => {
	const { user, book, quantity,orderDetails } = req.body;

	try {
		const order = await Order.create({ user, book, quantity,orderDetails });
		res.status(201).json(order);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the order.' });
	}
};

// UPDATE an existing order
exports.updateOrder = async (req, res) => {
	const { status } = req.body;

	try {
		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true }
		).populate('user', 'name email').populate('book', 'title price');
		if (!order) {
			return res.status(404).json({ message: 'Order not found.' });
		}
		res.json(order);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while updating the order.' });
	}
};

// DELETE an order
// exports.deleteOrder = async (req, res) => {
// 	try {
// 		const order = await Order.findByIdAndDelete(req.params.id);
// 		if (!order) {
// 			return res.status(404).json({ message: 'Order not found.' });
// 		}
// 		res.json({ message: 'Order deleted successfully.' });
// 	} catch (error) {
// 		res.status(400).json({ message: 'Error occurred while deleting the order.' });
// 	}
// };


