const express = require('express');
const router = express.Router();

const { getAllWriters, getWriterById, createWriter, updateWriter, deleteWriter,writerList } = require('../controllers/writer');
const { requireSignin, isAdmin } = require('../middlewares/auth');

// GET all writers
router.get('/writers', getAllWriters);
router.get('/writers/:pageNo/:perPage/:searchKeyword', writerList);

// GET a specific writer by ID
router.get('/writers/:id', getWriterById);

// CREATE a new writer
router.post('/writers', requireSignin, isAdmin, createWriter);

// UPDATE an existing writer
router.put('/writers/:id', requireSignin, isAdmin, updateWriter);

// DELETE a writer
router.delete('/writers/:id', requireSignin, isAdmin, deleteWriter);

module.exports = router;
