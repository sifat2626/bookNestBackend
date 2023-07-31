const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Writer",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publication",
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  stock: {
    type: Number,
    default: 0,
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
