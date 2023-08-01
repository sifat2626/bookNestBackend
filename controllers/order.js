// controllers/order.js
const mongoose = require('mongoose');

const Order = require("../models/order");

// GET all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.book", "title price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while retrieving orders.",
      error: error.message,
    });
  }
};

// GET a specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("book", "title price");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while retrieving the order." });
  }
};

// CREATE a new order
exports.createOrder = async (req, res) => {
  const { user, book, quantity, orderDetails, items, status } = req.body;

  try {
    const order = await Order.create({
      user,
      book,
      quantity,
      orderDetails,
      items,
      status,
    });
    res.status(201).json(order);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error occurred while creating the order." });
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
    )
      .populate("user", "name email")
      .populate("book", "title price");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error occurred while updating the order." });
  }
};

// get order by status
// it will also search by order id
exports.getOrderByStatus = async (req, res) => {
  let { page, pageSize, search, status } = req.params;
  page = Number(page) || 1;
  pageSize = Number(pageSize) || 3;
  search = search || "0";
  let skip = (page - 1) * pageSize;
  try {
    let query = { };
		query["status"] = status;

      if (search && search !== "0") {
				
				query.$or = [
					{ '_id': search },
				];
			}
		
    let totalCount;
    if (search && search !== "0") {
      totalCount = await Order.countDocuments(query);
    } else {
      totalCount = await Order.countDocuments({"status": status});
    }

    let orders = [];
    if (search && search !== "0") {
      orders = await Order.find(query)
        .populate("user", "name email")
        .populate("items.book", "title price")
        .skip(skip)
        .limit(pageSize);
    } else {
      orders = await Order.find({ status: status })
        .populate("user", "name email")
        .populate("items.book", "title price")
        .skip(skip)
        .limit(pageSize);
    }

    res.status(200).json({ data: orders, totalCount });

  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error occurred while retrieving orders.",
        error: error.message,
      });
  }
};


// aggregate way
exports.getOrdersWithStatus = async (req, res) => {
  let { page, pageSize, search } = req.params;
  page = Number(page) || 1;
  pageSize = Number(pageSize) || 3;
  search = search || "0";
  const desiredStatus = req.params.status;
  let skipRows = (page - 1) * pageSize;
  try {
    let data;
    let matchQuery = {
      status: desiredStatus,
    };

    if (search !== "0") {
      
      if (mongoose.Types.ObjectId.isValid(search)) {
        // Convert the search value to ObjectId
        search = mongoose.Types.ObjectId(search);
      } 
    

    matchQuery.$or = [
      { _id: search }, // Search in _id
    ];

// console.log('matchQuery',matchQuery);

    // MongoDB aggregation pipeline
    data = await Order.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'items.book',
          foreignField: '_id',
          as: 'bookObjects',
        },
      },
      {
        $addFields: {
          bookObjects: {
            $cond: {
              if: { $eq: [{ $size: '$bookObjects' }, 0] },
              then: [],
              else: {
                $map: {
                  input: '$bookObjects',
                  as: 'bookObject',
                  in: {
                    $mergeObjects: [
                      '$$bookObject',
                      {
                        quantity: {
                          $reduce: {
                            input: '$items',
                            initialValue: 0,
                            in: {
                              $cond: [
                                { $eq: ['$$this.book', '$$bookObject._id'] },
                                { $add: ['$$value', '$$this.quantity'] },
                                '$$value',
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          'user.name': 1,
          'user.email': 1,
          orderDetails: 1,
          _id: 1,
          bookObjects: 1,
        },
      },
      {
        $skip: skipRows,
      },
      {
        $limit: pageSize,
      },
    ]);}else{
      data = await Order.aggregate([
        {
          $match: { status: desiredStatus },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'books',
            localField: 'items.book',
            foreignField: '_id',
            as: 'bookObjects',
          },
        },
        {
          $addFields: {
            bookObjects: {
              $cond: {
                if: { $eq: [{ $size: '$bookObjects' }, 0] },
                then: [],
                else: {
                  $map: {
                    input: '$bookObjects',
                    as: 'bookObject',
                    in: {
                      $mergeObjects: [
                        '$$bookObject',
                        {
                          quantity: {
                            $reduce: {
                              input: '$items',
                              initialValue: 0,
                              in: {
                                $cond: [
                                  { $eq: ['$$this.book', '$$bookObject._id'] },
                                  { $add: ['$$value', '$$this.quantity'] },
                                  '$$value',
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            'user.name': 1,
            'user.email': 1,
            orderDetails: 1,
            _id: 1,
            bookObjects: 1,
          },
        },
        {
          $skip: skipRows,
        },
        {
          $limit: pageSize,
        },
      ]);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while retrieving orders.', "error": error.message });
  }
}

