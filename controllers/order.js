// controllers/order.js

const Order = require('../models/Order');

// GET all orders
const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().populate('user', 'name email').populate('book', 'title price');
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving orders.' });
	}
};

// GET a specific order by ID
const getOrderById = async (req, res) => {
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
const createOrder = async (req, res) => {
	const { user, book, quantity } = req.body;

	try {
		const order = await Order.create({ user, book, quantity });
		res.status(201).json(order);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the order.' });
	}
};

// UPDATE an existing order
const updateOrder = async (req, res) => {
	const { user, book, quantity } = req.body;

	try {
		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{ user, book, quantity },
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
const deleteOrder = async (req, res) => {
	try {
		const order = await Order.findByIdAndDelete(req.params.id);
		if (!order) {
			return res.status(404).json({ message: 'Order not found.' });
		}
		res.json({ message: 'Order deleted successfully.' });
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while deleting the order.' });
	}
};

module.exports = {
	getAllOrders,
	getOrderById,
	createOrder,
	updateOrder,
	deleteOrder
};
