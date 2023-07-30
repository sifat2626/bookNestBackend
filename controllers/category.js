const Category = require('../models/category');
const {v2: cloudinary} = require("cloudinary");

// GET all categories
exports.getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find();
		res.json(categories);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving categories.' });
	}
};

// GET a specific category by ID
exports.getCategoryById = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		if (!category) {
			return res.status(404).json({ message: 'Category not found.' });
		}
		res.json(category);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving the category.' });
	}
};


// CREATE a new category
exports.createCategory = async (req, res) => {
	const { name } = req.fields;
	const { photo } = req.files;
	if (photo && photo.size > 1000000) {
		return res.status(400).json({ error: 'Image should be less than 1mb in size' });
	}
	let photoUrl = "https://i.postimg.cc/SxN3MBcH/not-found.png";
	if (photo) {
		const result = await cloudinary.uploader.upload(photo.path, {
			folder: 'bookNest/categoryPhotos', // Specify the folder in Cloudinary to store book photos
		});
		photoUrl = result.secure_url;

	}

	try {
		// Check if a category with the same name already exists
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return res.status(400).json({ message: 'Category with the same name already exists.' });
		}

		// Create the category if it doesn't already exist
		const category = await Category.create({
			name,
			photo:photoUrl
		});
		res.status(201).json(category);
	} catch (error) {
		res.status(400).json({ message: error });
	}
};


exports.updateCategory = async (req, res) => {
	try {
		const categoryId = req.params.id;
		const { name } = req.fields;
		const { photo } = req.files;

		// Check if the category with the provided ID exists
		const existingCategory = await Category.findById(categoryId);
		if (!existingCategory) {
			return res.status(404).json({ message: 'Category not found' });
		}

		// Update the name if it is provided
		if (name) {
			// Check if a category with the same name already exists (excluding the current category being updated)
			const categoryWithSameName = await Category.findOne({ name, _id: { $ne: categoryId } });
			if (categoryWithSameName) {
				return res.status(400).json({ message: 'Category with the same name already exists' });
			}
			existingCategory.name = name;
		}

		// Handle photo update
		if (photo) {
			// Validate photo size
			if (photo.size > 1000000) {
				return res.status(400).json({ error: 'Image should be less than 1mb in size' });
			}

			// Upload the new photo to Cloudinary
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/categoryPhotos', // Specify the folder in Cloudinary to store category photos
			});
			existingCategory.photo = result.secure_url;

		}

		// Save the updated category to the database
		await existingCategory.save();

		res.status(200).json(existingCategory);
	} catch (error) {
		res.status(400).json({ message: error });
	}
};

exports.deleteCategory = async (req, res) => {
	try {
		const categoryId = req.params.id;

		// Check if the category with the provided ID exists
		const existingCategory = await Category.findById(categoryId);
		if (!existingCategory) {
			return res.status(404).json({ message: 'Category not found' });
		}

		// Delete the category from the database
		await existingCategory.remove();

		res.status(200).json({ message: 'Category deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred while deleting the category' });
	}
};



