const express = require('express');
const router = express.Router();


const {
	getAllPublications,
	getPublicationById,
	createPublication,
	updatePublication,
	deletePublication
} = require('../controllers/publication');
const {requireSignin, isAdmin} = require("../middlewares/auth");

// GET all publications
router.get('/publications', getAllPublications);

// GET a specific publication by ID
router.get('/publications/:id', getPublicationById);

// CREATE a new publication
router.post('/publications',requireSignin,isAdmin, createPublication);

// UPDATE an existing publication
router.put('/publications/:id', updatePublication);

// DELETE a publication
router.delete('/publications/:id', deletePublication);

module.exports = router;
