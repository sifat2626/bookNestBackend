const express = require('express');
const router = express.Router();
// const formidable =require("express-formidable");


const {createWriter} = require('../controllers/writer');
const {requireSignin, isAdmin} = require("../middlewares/auth");

router.post('/writers',requireSignin,isAdmin,createWriter)
module.exports = router;
