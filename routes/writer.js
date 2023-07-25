const express = require('express');
const router = express.Router();
const formidable =require("express-formidable");

const { getAllWriters, getWriterById, createWriter, updateWriter, deleteWriter } = require('../controllers/writer');
const {requireSignin, isAdmin} = require("../middlewares/auth");

// GET all publications


module.exports = router;
