const Book = require('../models/Book');
const fs = require("fs");


// GET all books
const getAllBooks = async (req, res) => {
	try {
		const books = await Book.find()
			.populate('author', 'name')
			.populate('categories', 'name')
			.populate('publication', 'name')
			.populate('reviews', 'title');
		res.json(books);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving books.' });
	}
};

// GET a specific book by ID
const getBookById = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id)
			.populate('author', 'name')
			.populate('categories', 'name')
			.populate('publication', 'name')
			.populate('reviews', 'title');
		if (!book) {
			return res.status(404).json({ message: 'Book not found.' });
		}
		res.json(book);
	} catch (error) {
		res.status(500).json({ message: error });
	}
};


// CREATE a new book



// Controller to create a new book
const createBook = async (req, res) => {
	try {
		const { title, author, description, price, discount, category, publication, stock } = req.fields;
		const photo = req.files?.photo; // Assuming the field name for the photo is 'photo'.

		// Validate required fields
		if (!title?.trim() || !author?.trim() || !description?.trim() || !price || !stock) {
			return res.status(400).json({ error: 'Title, author, description, price, and stock are required' });
		}

		// Validate photo size
		if (photo && photo.size > 1000000) {
			return res.status(400).json({ error: 'Image should be less than 1mb in size' });
		}

		// Create a new book object
		const newBook = new Book({
			title,
			author,
			description,
			price,
			discount,
			category,
			publication,
			stock,
		});

		// If photo is present, handle file upload
		if (photo) {
			newBook.photo.data = fs.readFileSync(photo.path);
			newBook.photo.contentType = photo.type;
		}

		// Save the new book to the database
		await newBook.save();

		res.status(201).json(newBook);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while creating the book' });
	}
};

// UPDATE an existing book
// Controller to update an existing book
const updateBook = async (req, res) => {
	try {
		const { title, author, description, price, discount, category, publication, stock } = req.fields;
		const photo = req.files?.photo; // Assuming the field name for the photo is 'photo'.
		const bookId = req.params.id; // Assuming you are passing the book ID in the URL parameter.

		// Validate required fields
		if (!title?.trim() || !author?.trim() || !description?.trim() || !price || !stock) {
			return res.status(400).json({ error: 'Title, author, description, price, and stock are required' });
		}

		// Find the existing book by ID
		const existingBook = await Book.findById(bookId);

		if (!existingBook) {
			return res.status(404).json({ error: 'Book not found' });
		}

		// Update the book properties
		existingBook.title = title;
		existingBook.author = author;
		existingBook.description = description;
		existingBook.price = price;
		existingBook.discount = discount || 0;
		existingBook.category = category || [];
		existingBook.publication = publication;
		existingBook.stock = stock;

		// If photo is present, handle file upload
		if (photo) {
			if (photo.size > 1000000) {
				return res.status(400).json({ error: 'Image should be less than 1mb in size' });
			}
			existingBook.photo.data = fs.readFileSync(photo.path);
			existingBook.photo.contentType = photo.type;
		}

		// Save the updated book to the database
		await existingBook.save();

		res.status(200).json(existingBook);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while updating the book' });
	}
};

// DELETE a book
const deleteBook = async (req, res) => {
	try {
		const book = await Book.findByIdAndDelete(req.params.id);
		if (!book) {
			return res.status(404).json({ message: 'Book not found.' });
		}
		res.json({ message: 'Book deleted successfully.' });
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while deleting the book.' });
	}
};

const booksByCategory = async (req, res) => {
	try {
		const categoryId = req.params.categoryId;

		// Find all books that have the specified category in their category array
		const books = await Book.find({ category: categoryId }).populate('author category publication');

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books found for the specified category' });
		}

		res.status(200).json(books);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while fetching books by category' });
	}
};

module.exports = {
	getAllBooks,
	getBookById,
	createBook,
	updateBook,
	deleteBook,
	booksByCategory
};
