const express = require('express');
const router = express.Router();
const formidable= require('express-formidable');


const {
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory
} = require('../controllers/category');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all categories
router.get('/categories', getAllCategories);

// GET a specific category by ID
router.get('/categories/:id', getCategoryById);

// CREATE a new category
router.post('/categories', requireSignin, isAdmin,formidable(), createCategory);

// UPDATE an existing category
router.put('/categories/:id', requireSignin, isAdmin,formidable(), updateCategory);

// DELETE a category
router.delete('/categories/:id', requireSignin, isAdmin, deleteCategory);

module.exports = router;
