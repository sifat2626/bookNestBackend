const Book = require("../models/book");
const fs = require("fs");
const Category = require("../models/category");
const Publication = require("../models/publication");
const Writer = require("../models/writer");

// NOTE: similar book controller is missing
// GET all books
exports.getAllBooks = async (req, res) => {
  let pageNo = Number(req.params.pageNo) || 1;
  let perPage = Number(req.params.perPage) || 15;
  let searchValue = req.params.searchKeyword;
  let skipRow = (pageNo - 1) * perPage;
  let SearchRgx = { $regex: searchValue, $options: "i" };
  // search in every possible field
  let SearchQuery = {
    $or: [
      { title: SearchRgx },
      { "author.name": SearchRgx },
      { "category.name": SearchRgx },
      { "publication.name": SearchRgx },
    ],
  };

  try {
    const books = await Book.find(SearchQuery)
      .populate("author", "name")
      .populate("category", "name")
      .populate("publication", "name")
      .skip(skipRow)
      .limit(perPage);
    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while retrieving books.",
      error: error.message,
    });
  }
};
// modified for page and search system
exports.bookList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo) || 1;
    let perPage = Number(req.params.perPage) || 15;
    let searchValue = req.params.searchKeyword;
    let skipRow = (pageNo - 1) * perPage;

    let data;
    if (searchValue !== "0") {
      let SearchRgx = { $regex: searchValue, $options: "i" };
      // search in every possible field
      let SearchQuery = {
        $or: [
          { title: SearchRgx },
          { "author[0].name": SearchRgx },
          { "category[0].name": SearchRgx },
          { "publication[0].name": SearchRgx },
        ],
      };

      data = await Book.aggregate([
        {
          $facet: {
            Total: [{ $match: SearchQuery }, { $count: "count" }],
            Rows: [
              { $match: SearchQuery },
              {
                $lookup: {
                  from: "writers",
                  localField: "author",
                  foreignField: "_id",
                  as: "author",
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category",
                },
              },
              {
                $lookup: {
                  from: "publications",
                  localField: "publication",
                  foreignField: "_id",
                  as: "publication",
                },
              },

              { $skip: skipRow },
              { $limit: perPage },
             
            ],
          },
        },
        { $sort: { createdAt: 1 } }
      ]);
    } else {
      data = await Book.aggregate([
        {
          $facet: {
            Total: [{ $count: "count" }],
            Rows: [
              {
                $lookup: {
                  from: "writers",
                  localField: "author",
                  foreignField: "_id",
                  as: "author",
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category",
                },
              },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
        { $sort: { createdAt: -1 } }
      ]);
    }
    // console.log('data', data[0].Rows[0]);

    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error });
  }
};

// GET a specific book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .populate("category")
      .populate("publication");
    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while retrieving book.",
      error: error.message,
    });
  }
};

// CREATE a new book

// Controller to create a new book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      photo,
      description,
      price,
      discount,
      category,
      publication,
      stock,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !author?.trim() ||
      !description?.trim() ||
      !price ||
      !stock
    ) {
      return res.status(400).json({
        error: "Title, author, description, price, and stock are required",
      });
    }

    // Validate photo size
    // if (photo && photo.size > 1000000) {
    // 	return res.status(400).json({ error: 'Image should be less than 1mb in size' });
    // }

    // Create a new book object
    const newBook = new Book({
      title,
      author,
      photo,
      description,
      price,
      discount,
      category,
      publication,
      stock,
    });

    // If photo is present, handle file upload
    // if (photo) {
    // 	newBook.photo.data = fs.readFileSync(photo.path);
    // 	newBook.photo.contentType = photo.type;
    // }

    // Save the new book to the database
    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "An error occurred while creating the book" });
  }
};

// UPDATE an existing book
// Controller to update an existing book
exports.updateBook = async (req, res) => {
  try {
    const {
      title,
      photo,
      author,
      description,
      price,
      discount,
      category,
      publication,
      stock,
    } = req.body;
    // const photo = req.files?.photo; // Assuming the field name for the photo is 'photo'.
    const bookId = req.params.id; // Assuming you are passing the book ID in the URL parameter.

    // Validate required fields
    // if (
    //   !title?.trim() ||
    //   !author?.trim() ||
    //   !description?.trim() ||
    //   !price ||
    //   !stock
    // ) {
    //   return res.status(400).json({
    //     error: "Title, author, description, price, and stock are required",
    //   });
    // }

    // Find the existing book by ID
    const existingBook = await Book.findById(bookId);

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Update the book properties
    existingBook.title = title || existingBook.title;
    existingBook.author = author || existingBook.author;
    existingBook.description = description || existingBook.description;
    existingBook.price = price || existingBook.price;
    existingBook.discount = discount || 0;
    existingBook.category = category || existingBook.category;
    existingBook.publication = publication || existingBook.publication;
    existingBook.stock = stock || existingBook.stock;
    existingBook.photo = photo || existingBook.photo;

    // If photo is present, handle file upload
    // if (photo) {
    // 	if (photo.size > 1000000) {
    // 		return res.status(400).json({ error: 'Image should be less than 1mb in size' });
    // 	}
    // 	existingBook.photo.data = fs.readFileSync(photo.path);
    // 	existingBook.photo.contentType = photo.type;
    // }

    // Save the updated book to the database
    await existingBook.save();

    res.status(200).json(existingBook);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the book" });
  }
};

// DELETE a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error occurred while deleting the book." });
  }
};

exports.searchBooksByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    // Find the category by name
    const category = await Category.findOne({
      // name: categoryName,
      name: { $regex: new RegExp(categoryName, "i") },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Use the category ID to find books with that category
    const books = await Book.find({ category: category._id })
      .populate("author", "name") // Populate the author field with the name only
      .populate("category", "name") // Populate the category field with the name only
      .populate("publication", "name"); // Populate the publication field with the name only
    // .select("title author category publication "); // Select specific fields to return

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found in the specified category." });
    }

    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error occurred while searching for books in the category.",
    });
  }
};
exports.searchBooksByPublication = async (req, res) => {
  try {
    const publicationName = req.params.publicationName;

    // Find the publication by name
    const publication = await Publication.findOne({
      name: { $regex: new RegExp(publicationName, "i") },
    });

    if (!publication) {
      return res.status(404).json({ message: "Publication not found." });
    }

    // Use the publication ID to find books with that publication
    const books = await Book.find({ publication: publication._id })
      .populate("author", "name") // Populate the author field with the name only
      .populate("category", "name") // Populate the category field with the name only
      .populate("publication", "name") // Populate the publication field with the name only
      .select("title author category publication"); // Select specific fields to return

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found from the specified publication." });
    }

    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error occurred while searching for books from the publication.",
    });
  }
};

exports.searchBooksByAuthor = async (req, res) => {
  try {
    const authorName = req.params.authorName;

    // Find the author by name
    const author = await Writer.findOne({
      name: { $regex: new RegExp(authorName, "i") },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found." });
    }

    // Use the author ID to find books written by that author
    const books = await Book.find({ author: author._id })
      .populate("author", "name") // Populate the author field with the name only
      .populate("category", "name") // Populate the category field with the name only
      .populate("publication", "name") // Populate the publication field with the name only
      .select("title author category publication photo"); // Select specific fields to return

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found by the specified author." });
    }

    res.json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error occurred while searching for books by the author.",
    });
  }
};
exports.searchBooksByTitle = async (req, res) => {
  try {
    const bookTitle = req.params.bookTitle;

    // Use the $regex operator with 'i' option for case-insensitive search
    const books = await Book.find({
      title: { $regex: new RegExp(bookTitle, "i") },
    })
      .populate("author") // Populate the author field with the name only
      .populate("category") // Populate the category field with the name only
      .populate("publication") // Populate the publication field with the name only
      

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found with the specified title." });
    }

    res.json(books);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occurred while searching for books.",error:error });
  }
};

// docs: related products
exports.relatedBooks = async (req, res) => {
  try {
    const { bookId, categoryId } = req.params;
    const related = await Book.find({
      category: categoryId,
      _id: { $ne: bookId },
    })
      .populate("category")
      .populate("author")
      .populate("publication")
      .limit(4)
      .sort({ createdAt: -1 })
      ;

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};



// GET books written by a specific writer with pagination
exports.getBooksByWriterId = async (req, res) => {
  try {
    const writerId = req.params.authorId;
    let pageNo = Number(req.query.pageNo) || 1;
    let perPage = Number(req.query.perPage) || 10;
    let skipRow = (pageNo - 1) * perPage;

    // Find total count of books by the specified writer
    const totalBooks = await Book.countDocuments({ author: writerId });

    // Find books written by the specified writer with pagination
    const books = await Book.find({ author: writerId })
      .populate('author', 'name')
      .populate('category', 'name')
      .populate('publication', 'name')
      .skip(skipRow)
      .limit(perPage);

    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found by the specified writer.' });
    }

    res.json({ totalBooks, books });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error occurred while retrieving books by the writer.',
      error: error.message,
    });
  }
};





exports.filterBooks = async (req, res) => {
  try {
    const { categories, minPrice, maxPrice, publications, authors,sort,perPage } = req.query;
    const page=1;
   
    // Build your query based on the provided criteria
    let query = {};

    if (categories) {
      // Find category by name
      const category = await Category.findOne({ name: categories });

      if (category) {
        query['category'] = category._id;
      }
    }

    // if (minPrice && maxPrice) {
    //   query['price'] = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    // }
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    if (minPrice) {
      query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    }
    if (publications) {
      // Find publication by name
      const publication = await Publication.findOne({ name: publications });

      if (publication) {
        query['publication'] = publication._id;
      }
    }

    if (authors) {
      // Find publication by name
      const author = await Writer.findOne({ name: authors });

      if (author) {
        query['author'] = author._id;
      }
    }

    let sortOptions = {};
    if (sort === "atoz") {
      sortOptions.title = 1;
    } else if (sort === "ztoa") {
      sortOptions.title = -1;
    }

    const total = await Book.countDocuments(query);
    // Perform the search with the constructed query
    const filteredBooks = await Book.find(query)
      .populate("author", "name")
      .populate("category", "name")
      .populate("publication", "name")
      .sort(sortOptions)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({filteredBooks,total});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error occurred while filtering books.",
      error: error.message,
    });
  }
};