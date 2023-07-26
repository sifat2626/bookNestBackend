const Book = require('../models/book');
const fs = require("fs");
const Category = require("../models/category");
const Publication = require("../models/publication");
const Writer = require("../models/writer");


// GET all books
exports.getAllBooks = async (req, res) => {
	try {
		const books = await Book.find()
			.populate('author', 'name')
			.populate('category', 'name')
			.populate('publication', 'name')
		res.json(books);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving books.',error });
	}
};

// GET a specific book by ID
exports.getBookById = async (req, res) => {
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
exports.createBook = async (req, res) => {
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
exports.updateBook = async (req, res) => {
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
exports.deleteBook = async (req, res) => {
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

exports.searchBook = async (req, res) => {
	try {
		// Get the search query from the request parameters
		const { query } = req.params;

		// Perform a case-insensitive search for books with matching title or author
		const searchResults = await Book.find({
			$or: [
				{ title: { $regex: query, $options: 'i' } },
				{ author: { $regex: query, $options: 'i' } },
			],
		})
			.populate('author', 'name') // Populate the author field with the name only
			.populate('category', 'name') // Populate the category field with the name only
			.populate('publication', 'name') // Populate the publication field with the name only
			.select('title author category publication'); // Select specific fields to return

		// Send the search results as the response
		res.json(searchResults);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: 'Failed to search for books' });
	}
};

exports.searchBooksByCategory = async (req, res) => {
	try {
		const categoryName = req.params.categoryName;

		// Find the category by name
		const category = await Category.findOne({ name: { $regex: new RegExp(categoryName, 'i') } });

		if (!category) {
			return res.status(404).json({ message: 'Category not found.' });
		}

		// Use the category ID to find books with that category
		const books = await Book.find({ category: category._id })
			.populate('author', 'name') // Populate the author field with the name only
			.populate('category', 'name') // Populate the category field with the name only
			.populate('publication', 'name') // Populate the publication field with the name only
			.select('title author category publication'); // Select specific fields to return

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books found in the specified category.' });
		}

		res.json(books);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error occurred while searching for books in the category.' });
	}
};
exports.searchBooksByPublication = async (req, res) => {
	try {
		const publicationName = req.params.publicationName;

		// Find the publication by name
		const publication = await Publication.findOne({ name: { $regex: new RegExp(publicationName, 'i') } });

		if (!publication) {
			return res.status(404).json({ message: 'Publication not found.' });
		}

		// Use the publication ID to find books with that publication
		const books = await Book.find({ publication: publication._id })
			.populate('author', 'name') // Populate the author field with the name only
			.populate('category', 'name') // Populate the category field with the name only
			.populate('publication', 'name') // Populate the publication field with the name only
			.select('title author category publication'); // Select specific fields to return

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books found from the specified publication.' });
		}

		res.json(books);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error occurred while searching for books from the publication.' });
	}
};

exports.searchBooksByAuthor = async (req, res) => {
	try {
		const authorName = req.params.authorName;

		// Find the author by name
		const author = await Writer.findOne({ name: { $regex: new RegExp(authorName, 'i') } });

		if (!author) {
			return res.status(404).json({ message: 'Author not found.' });
		}

		// Use the author ID to find books written by that author
		const books = await Book.find({ author: author._id })
			.populate('author', 'name') // Populate the author field with the name only
			.populate('category', 'name') // Populate the category field with the name only
			.populate('publication', 'name') // Populate the publication field with the name only
			.select('title author category publication'); // Select specific fields to return

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books found by the specified author.' });
		}

		res.json(books);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error occurred while searching for books by the author.' });
	}
};

