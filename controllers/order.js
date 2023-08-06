// controllers/order.js
const mongoose = require("mongoose");

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

// UPDATE an existing order by ID (only status can be updated)
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
    let query = {};
    query["status"] = status;

    if (search && search !== "0") {
      query.$or = [{ _id: search }];
    }

    let totalCount;
    if (search && search !== "0") {
      totalCount = await Order.countDocuments(query);
    } else {
      totalCount = await Order.countDocuments({ status: status });
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
    res.status(500).json({
      message: "Error occurred while retrieving orders.",
      error: error.message,
    });
  }
};

// get orders by status
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
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "books",
            localField: "items.book",
            foreignField: "_id",
            as: "bookObjects",
          },
        },
        {
          $addFields: {
            bookObjects: {
              $cond: {
                if: { $eq: [{ $size: "$bookObjects" }, 0] },
                then: [],
                else: {
                  $map: {
                    input: "$bookObjects",
                    as: "bookObject",
                    in: {
                      $mergeObjects: [
                        "$$bookObject",
                        {
                          quantity: {
                            $reduce: {
                              input: "$items",
                              initialValue: 0,
                              in: {
                                $cond: [
                                  { $eq: ["$$this.book", "$$bookObject._id"] },
                                  { $add: ["$$value", "$$this.quantity"] },
                                  "$$value",
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
            "user.name": 1,
            "user.email": 1,
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
    } else {
      data = await Order.aggregate([
        {
          $match: { status: desiredStatus },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "books",
            localField: "items.book",
            foreignField: "_id",
            as: "bookObjects",
          },
        },
        {
          $addFields: {
            bookObjects: {
              $cond: {
                if: { $eq: [{ $size: "$bookObjects" }, 0] },
                then: [],
                else: {
                  $map: {
                    input: "$bookObjects",
                    as: "bookObject",
                    in: {
                      $mergeObjects: [
                        "$$bookObject",
                        {
                          quantity: {
                            $reduce: {
                              input: "$items",
                              initialValue: 0,
                              in: {
                                $cond: [
                                  { $eq: ["$$this.book", "$$bookObject._id"] },
                                  { $add: ["$$value", "$$this.quantity"] },
                                  "$$value",
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
            "user.name": 1,
            "user.email": 1,
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
    res.status(500).json({
      message: "Error occurred while retrieving orders.",
      error: error.message,
    });
  }
};

// note: chartjs data format
// get order for last 7 days

exports.ordersCountForLastSevenDays = async (req, res) => {
  const currentDate = new Date();
  const sevenDaysAgo = new Date(
    currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
  );

  console.log("sevenDaysAgo", sevenDaysAgo);
  console.log("currentDate", currentDate);

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo, $lte: currentDate },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        day: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "Sunday" },
              { case: { $eq: ["$_id", 2] }, then: "Monday" },
              { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
              { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
              { case: { $eq: ["$_id", 5] }, then: "Thursday" },
              { case: { $eq: ["$_id", 6] }, then: "Friday" },
              { case: { $eq: ["$_id", 7] }, then: "Saturday" },
            ],
            default: "Unknown",
          },
        },
        count: 1,
      },
    },
  ]);

  res.status(200).json(data);
};

// get order status for current days
// like for today how many orders are pending, delivered, cancelled
// this showing 1 item less than the total number of orders for pending status. so, need to check
// for now modified the data in the fontend while showing by adding extra one item for pending status
exports.orderStateForCureentDay = async (req, res) => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const data = await Order.aggregate([
    {
      $match: {
        $or: [
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
  ]);

  res.status(200).json(data);
};

// count total amount received for today
exports.totalAmountReceivedForToday = async (req, res) => {
  let startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const data = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        $or: [
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "items.book",
        foreignField: "_id",
        as: "bookObjects",
      },
    },
    {
      $addFields: {
        bookObjects: {
          $cond: {
            if: { $eq: [{ $size: "$bookObjects" }, 0] },
            then: [],
            else: {
              $map: {
                input: "$bookObjects",
                as: "bookObject",
                in: {
                  $mergeObjects: [
                    "$$bookObject",
                    {
                      quantity: {
                        $reduce: {
                          input: "$items",
                          initialValue: 0,
                          in: {
                            $cond: [
                              { $eq: ["$$this.book", "$$bookObject._id"] },
                              { $add: ["$$value", "$$this.quantity"] },
                              "$$value",
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
      $unwind: "$bookObjects",
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: { $multiply: ["$bookObjects.price", "$bookObjects.quantity"] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: "today",
        totalAmount: 1,
      },
    },
  ]);
  res.json(data);
};

// exports.amountReceivedPerDay = async (req, res) => {
//   let daysAgo = 0; // Default to today

//   const value = parseInt(req.params.value);
//   if (!isNaN(value) && value > 0) {
//     daysAgo = value;
//   }

//   const startOfDay = new Date();
//   startOfDay.setHours(0, 0, 0, 0);
//   startOfDay.setDate(startOfDay.getDate() - daysAgo);

//   const endOfDay = new Date(startOfDay);
//   endOfDay.setHours(23, 59, 59, 999);

//   const data = await Order.aggregate([
//     {
//       $match: {
//         status: "Delivered",
//         $or: [
//           { createdAt: { $gte: startOfDay, $lte: endOfDay } },
//           { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
//         ],
//       },
//     },
//     {
//       $lookup: {
//         from: "books",
//         localField: "items.book",
//         foreignField: "_id",
//         as: "bookObjects",
//       },
//     },
//     {
//       $addFields: {
//         bookObjects: {
//           $cond: {
//             if: { $eq: [{ $size: "$bookObjects" }, 0] },
//             then: [],
//             else: {
//               $map: {
//                 input: "$bookObjects",
//                 as: "bookObject",
//                 in: {
//                   $mergeObjects: [
//                     "$$bookObject",
//                     {
//                       quantity: {
//                         $reduce: {
//                           input: "$items",
//                           initialValue: 0,
//                           in: {
//                             $cond: [
//                               { $eq: ["$$this.book", "$$bookObject._id"] },
//                               { $add: ["$$value", "$$this.quantity"] },
//                               "$$value",
//                             ],
//                           },
//                         },
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     {
//       $unwind: "$bookObjects",
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: { format: "%d-%m-%Y", date: startOfDay },
//         },
//         totalAmount: {
//           $sum: { $multiply: ["$bookObjects.price", "$bookObjects.quantity"] },
//         },
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         day: "$_id",
//         totalAmount: {
//           $cond: [{ $eq: ["$count", 0] }, 0, "$totalAmount"],
//         },
//       },
//     },
//   ]);
//   res.json(data);
// };
exports.amountReceivedPerDay = async (req, res) => {
  let daysAgo = 0; // Default to today

  const value = parseInt(req.params.value);
  if (!isNaN(value) && value > 0) {
    daysAgo = value;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  startOfDay.setDate(startOfDay.getDate() - daysAgo);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const data = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        $or: [
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "items.book",
        foreignField: "_id",
        as: "bookObjects",
      },
    },
    {
      $addFields: {
        bookObjects: {
          $cond: {
            if: { $eq: [{ $size: "$bookObjects" }, 0] },
            then: [],
            else: {
              $map: {
                input: "$bookObjects",
                as: "bookObject",
                in: {
                  $mergeObjects: [
                    "$$bookObject",
                    {
                      quantity: {
                        $reduce: {
                          input: "$items",
                          initialValue: 0,
                          in: {
                            $cond: [
                              { $eq: ["$$this.book", "$$bookObject._id"] },
                              { $add: ["$$value", "$$this.quantity"] },
                              "$$value",
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
      $unwind: "$bookObjects",
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%d-%m-%Y", date: startOfDay },
        },
        totalAmount: {
          $sum: { $multiply: ["$bookObjects.price", "$bookObjects.quantity"] },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        totalAmount: {
          $cond: [{ $eq: ["$count", 0] }, 0, "$totalAmount"],
        },
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            day: "$day",
            totalAmount: "$totalAmount",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: {
          $cond: [
            { $eq: [{ $size: "$data" }, 0] },
            [{ day: "", totalAmount: 0 }],
            "$data",
          ],
        },
      },
    },
  ]).exec(); // Call exec() to ensure the aggregation is executed
  res.json(
    data && data[0] && data[0].data
      ? data[0].data
      : [{ day: "no data available with this day", totalAmount: 0 }]
  );
};
