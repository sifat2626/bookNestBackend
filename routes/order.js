const express = require('express');
const router = express.Router();

const {
	getAllOrders,
	getOrderById,
	createOrder,
	updateOrder,
	// deleteOrder
} = require('../controllers/order');

// GET all orders
router.get('/orders', getAllOrders);

// GET a specific order by ID
router.get('/orders/:id', getOrderById);

// CREATE a new order
router.post('/orders', createOrder);

// UPDATE an existing order
router.put('/orders/:id', updateOrder);

// DELETE an order
// router.delete('/orders/:id', deleteOrder);

module.exports = router;
