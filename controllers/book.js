const cloudinary = require('cloudinary').v2;
const Book = require('../models/book');
const Category = require('../models/category');
const Publication = require('../models/publication');
const Writer = require('../models/writer');

// Configure Cloudinary with your Cloudinary credentials
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET
});

// GET all books
exports.getAllBooks = async (req, res) => {
	try {
		const books = await Book.find()
			.populate('author', 'name')
			.populate('category', 'name')
			.populate('publication', 'name');
		res.json(books);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving books.', error });
	}
};

// GET a specific book by ID
exports.getBookById = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id)
		if (!book) {
			return res.status(404).json({ message: 'Book not found.' });
		}
		res.json(book);
	} catch (error) {
		res.status(500).json({ message: error });
	}
};

// Controller to create a new book
exports.createBook = async (req, res) => {
	try {
		console.log(`files ====>`+req.files)
		const { title, author, description, price, category, publication, stock } = req.fields;
		const { photo } = req.files;
		// Assuming the field name for the photo is 'photo'.
		console.log(photo)
		// Validate required fields
		if (!title?.trim() || !author?.trim() || !description?.trim() || !price || !stock) {
			return res.status(400).json({ error: 'Title, author, description, price, and stock are required' });
		}

		// Validate photo size
		if (photo && photo.size > 1000000) {
			return res.status(400).json({ error: 'Image should be less than 1mb in size' });
		}
		console.log(`photo is `+photo)
		// Upload the photo to Cloudinary
		let photoUrl = null;
		if (photo) {
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/bookPhotos', // Specify the folder in Cloudinary to store book photos
			});
			photoUrl = result.secure_url;
			console.log(result)
		}

		// Create a new book object with the Cloudinary photo URL
		const newBook = new Book({
			title,
			author,
			description,
			price,
			category,
			publication,
			stock,
			photo: photoUrl,
		});

		// Save the new book to the database
		await newBook.save();

		res.status(201).json(newBook);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while creating the book' });
	}
};



exports.updateBook = async (req, res) => {
	try {
		// Extract book ID from the URL params
		const bookId = req.params.bookId;

		// Find the book by its ID
		const bookToUpdate = await Book.findById(bookId);

		if (!bookToUpdate) {
			return res.status(404).json({ error: 'Book not found' });
		}

		// Update the book details with the new values from the form fields
		const { title, author, description, price, category, publication, stock } = req.fields;
		bookToUpdate.title = title || bookToUpdate.title;
		bookToUpdate.author = author || bookToUpdate.author;
		bookToUpdate.description = description || bookToUpdate.description;
		bookToUpdate.price = price || bookToUpdate.price;
		bookToUpdate.category = category || bookToUpdate.category;
		bookToUpdate.publication = publication || bookToUpdate.publication;
		bookToUpdate.stock = stock || bookToUpdate.stock;

		// Handle photo update
		if (req.files && req.files.photo) {
			const photo = req.files.photo;

			// Validate photo size
			if (photo.size > 1000000) {
				return res.status(400).json({ error: 'Image should be less than 1mb in size' });
			}

			// Upload the new photo to Cloudinary
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/bookPhotos', // Specify the folder in Cloudinary to store book photos
			});
			bookToUpdate.photo = result.secure_url;
			console.log('Cloudinary result:', result);
		}

		// Save the updated book to the database
		await bookToUpdate.save();

		res.status(200).json(bookToUpdate);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while updating the book' });
	}
};

// Controller to delete a book
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

// Controller to search books by category
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

// Controller to search books by publication
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

// Controller to search books by author
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

// Controller to search books by title
exports.searchBooksByTitle = async (req, res) => {
	try {
		const bookTitle = req.params.bookTitle;

		// Use the $regex operator with 'i' option for case-insensitive search
		const books = await Book.find({
			title: { $regex: new RegExp(bookTitle, 'i') },
		})
			.populate('author', 'name') // Populate the author field with the name only
			.populate('category', 'name') // Populate the category field with the name only
			.populate('publication', 'name') // Populate the publication field with the name only
			.select('title author category publication photo'); // Select specific fields to return

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books found with the specified title.' });
		}

		res.json(books);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error occurred while searching for books.' });
	}
};
