const express = require('express');
const router = express.Router();

const category = require('../controllers/category');
// const {categoryList} = require('../controllers/category');
const { requireSignin, isAdmin } = require('../middlewares/auth');
// const Category = require('../models/category');

// GET all categories
router.get('/categories', category.getAllCategories);
router.get('/categories/:pageNo/:perPage/:searchKeyword',category.categoryList);

// GET a specific category by ID
router.get('/categories/:id', category.getCategoryById);

// CREATE a new category
router.post('/categories', requireSignin, isAdmin, category.createCategory);

// UPDATE an existing category
router.put('/categories/:id', requireSignin, isAdmin, category.updateCategory);

// DELETE a category
router.delete('/categories/:id', requireSignin, isAdmin, category.deleteCategory);

module.exports = router;
