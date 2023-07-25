const express = require('express');
const router = express.Router();
const formidable =require("express-formidable");

// const {
// 	getAllPublications,
// 	getPublicationById,
// 	createPublication,
// 	updatePublication,
// 	deletePublication
// } = require('../controllers/publication');
const {requireSignin, isAdmin} = require("../middlewares/auth");

// GET all publications


module.exports = router;
