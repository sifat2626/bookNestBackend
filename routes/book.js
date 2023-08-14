const express = require('express');
const router = express.Router();


const { filterBooks,getAllBooks,bookList, getBookById, createBook, updateBook, deleteBook,searchBooksByTitle,searchBooksByCategory,searchBooksByPublication,searchBooksByAuthor,relatedBooks,
	getBooksByWriterId
} = require('../controllers/book');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all books
router.get('/allbooks/:pageNo/:perPage/:searchKeyword', getAllBooks);
router.get('/booklist/:pageNo/:perPage/:searchKeyword', bookList);

// GET a specific book by ID
router.get('/search/book/:id', getBookById);
router.get('/similarbook/:bookId/:categoryId', relatedBooks);
router.get('/author/:authorId', getBooksByWriterId);

// CREATE a new book
router.post('/books', requireSignin, isAdmin, createBook);

router.get('/search/category/:categoryName',searchBooksByCategory);

router.get('/search/publication/:publicationName',searchBooksByPublication);

router.get('/search/author/:authorName',searchBooksByAuthor);

router.get('/search/books/:bookTitle',searchBooksByTitle);



// UPDATE an existing book
router.put('/books/:id', requireSignin, isAdmin, updateBook);

// DELETE a book
router.delete('/books/:id', requireSignin, isAdmin, deleteBook);

// filter book
router.get('/filter',filterBooks);
module.exports = router;
