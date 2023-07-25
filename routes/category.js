const express = require('express');
const router = express.Router();

const category = require('../controllers/category');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all categories
router.get('/categories', category.getAllCategories);

// GET a specific category by ID
router.get('/categories/:id', category.getCategoryById);

// CREATE a new category
router.post('/categories', requireSignin, isAdmin, category.createCategory);

// UPDATE an existing category
router.put('/categories/:id', requireSignin, isAdmin, category.updateCategory);

// DELETE a category
router.delete('/categories/:id', requireSignin, isAdmin, category.deleteCategory);

module.exports = router;
