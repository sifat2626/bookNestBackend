const express = require('express');
const router = express.Router();
const formidable =require("express-formidable");

const { getAllBooks, getBookById, createBook, updateBook, deleteBook,booksByCategory } = require('../controllers/book');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all books
router.get('/books', getAllBooks);

// GET a specific book by ID
router.get('/books/:id', getBookById);

// CREATE a new book
router.post('/books', requireSignin, isAdmin,formidable(), createBook);

router.get('/books/category/:categoryId',booksByCategory);

// UPDATE an existing book
router.put('/books/:id', requireSignin, isAdmin,formidable(), updateBook);

// DELETE a book
router.delete('/books/:id', requireSignin, isAdmin, deleteBook);

module.exports = router;
