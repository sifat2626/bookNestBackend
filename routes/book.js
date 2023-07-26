const express = require('express');
const router = express.Router();
const formidable =require("express-formidable");

const { getAllBooks, getBookById, createBook, updateBook, deleteBook,searchBooksByTitle,searchBooksByCategory,searchBooksByPublication,searchBooksByAuthor } = require('../controllers/book');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all books
router.get('/books', getAllBooks);

// GET a specific book by ID
router.get('/books/:id', getBookById);

// CREATE a new book
router.post('/books', requireSignin, isAdmin,formidable(), createBook);

router.get('/search/category/:categoryName',searchBooksByCategory);

router.get('/search/publication/:publicationName',searchBooksByPublication);

router.get('/search/author/:authorName',searchBooksByAuthor);

router.get('/search/book/:bookTitle',searchBooksByTitle);



// UPDATE an existing book
router.put('/books/:id', requireSignin, isAdmin,formidable(), updateBook);

// DELETE a book
router.delete('/books/:id', requireSignin, isAdmin, deleteBook);

module.exports = router;
