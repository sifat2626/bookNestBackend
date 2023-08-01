// controllers/order.js

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
				let searchRegex = new RegExp(search, "i");
				query.$or = [
					{ "user.name": searchRegex },
				];
			}
			console.log('user.name')
      console.log('Received params:', page, pageSize, search, status);
    console.log('query', query);
		
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

    // const orders = await Order.find({ status: req.params.status })
    //   .populate("user", "name email")
    //   .populate("items.book", "title price");
    // res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error occurred while retrieving orders.",
        error: error.message,
      });
  }
};

// get all order aggregate
// exports.getOrdersWithStatus = async (req, res) => {
//   const desiredStatus = req.params.status;
//   try {
//     // MongoDB aggregation pipeline
//     const orders = await Order.aggregate([
//       {
//         $match: { status: desiredStatus },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//       {
//         $lookup: {
//           from: "books",
//           localField: "items.book",
//           foreignField: "_id",
//           as: "book",
//         },
//       },
//       {
//         $project: {
//           status: 1,
//           user: { name: 1 },
//           items: {
//             $map: {
//               input: "$items",
//               as: "item",
//               in: {
//                 book: { title: "$$item.book.title" },
//                 quantity: "$$item.quantity",
//               },
//             },
//           },
//         },
//       },
//     ]);
//     res.status(200).json(orders);
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         message: "Error occurred while retrieving orders.",
//         error: error.message,
//       });
//   }
// };
// exports.getOrdersWithStatus=async(req,res)=> {
// 		const desiredStatus=req.params.status;
//   try {
//     // MongoDB aggregation pipeline
//     const orders = await Order.aggregate([
//       {
//         $match: { status: desiredStatus }
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'user',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
// 			{
// 				$unwind: '$user'
// 			},
//       {
//         $lookup: {
//           from: 'books',
//           localField: 'items.book',
//           foreignField: '_id',
//           as: 'book'
//         }
//       },
//       {
//         $project: {
//           status: 1,
//           user: { name: 1 },
//           items: {
//             $map: {
//               input: '$items',
//               as: 'item',
//               in: {
//                 book: { title: '$$item.book.title' },
//                 quantity: '$$item.quantity'
//               }
//             }
//           }
//         }
//       }
//     ]);
// 		res.status(200).json(orders);
// 			} catch (error) {
// 		res.status(500).json({ message: 'Error occurred while retrieving orders.' ,"error":error.message});
// 	}
// }
