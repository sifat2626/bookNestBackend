const express = require('express');
const router = express.Router();

const {
	getAllOrders,
	getOrderById,
	createOrder,
	updateOrder,
	getOrderByStatus,
	getOrdersWithStatus,
	ordersCountForLastSevenDays,
	orderStateForCureentDay,
	totalAmountReceivedForToday,
	amountReceivedPerDay
	// deleteOrder
} = require('../controllers/order');

const { requireSignin, isAdmin } = require('../middlewares/auth');
// GET all orders
router.get('/orders', getAllOrders);

// GET a specific order by ID
router.get('/orders/:id', getOrderById);
router.get('/getordersbystatus/:status/:page/:pageSize/:search', getOrderByStatus);
router.get('/ordersWithstatus/:status/:page/:pageSize/:search', getOrdersWithStatus);

// CREATE a new order
router.post('/orders', createOrder);

// UPDATE an existing order
router.put('/orders/:id',requireSignin,isAdmin, updateOrder);

// DELETE an order
// router.delete('/orders/:id', deleteOrder);

//  chartjs data
router.get('/lastsevendaysordercount', ordersCountForLastSevenDays);
router.get('/orderstateforcurrentday', orderStateForCureentDay)
router.get('/amountreceivedfortoday', totalAmountReceivedForToday)
router.get('/amountReceivedPerDay/:value', amountReceivedPerDay)

module.exports = router;
