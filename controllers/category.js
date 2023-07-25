const Category = require('../models/category');

// GET all categories
const getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find();
		res.json(categories);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving categories.' });
	}
};

// GET a specific category by ID
const getCategoryById = async (req, res) => {
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
const createCategory = async (req, res) => {
	const { name } = req.body;

	try {
		// Check if a category with the same name already exists
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return res.status(400).json({ message: 'Category with the same name already exists.' });
		}

		// Create the category if it doesn't already exist
		const category = await Category.create({ name });
		res.status(201).json(category);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the category.' });
	}
};

const updateCategory = async (req, res) => {
	const { name } = req.body;

	try {
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return res.status(400).json({ message: 'Category with the same name already exists.' });
		}

		const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
		if (!category) {
			return res.status(404).json({ message: 'Category not found.' });
		}
		res.json(category);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while updating the category.' });
	}
};

// DELETE a category
const deleteCategory = async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) {
			return res.status(404).json({ message: 'Category not found.' });
		}
		res.json({ message: 'Category deleted successfully.' });
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while deleting the category.' });
	}
};

module.exports = {
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory
};