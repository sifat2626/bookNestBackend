// controllers/writerController.js

const Writer = require('../models/writer');

// GET all writers
const getAllWriters = async (req, res) => {
	try {
		const writers = await Writer.find();
		res.json(writers);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving writers.' });
	}
};

// GET a specific writer by ID
const getWriterById = async (req, res) => {
	try {
		const writer = await Writer.findById(req.params.id);
		if (!writer) {
			return res.status(404).json({ message: 'Writer not found.' });
		}
		res.json(writer);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving the writer.' });
	}
};

// CREATE a new writer
const createWriter = async (req, res) => {
	const { name, biography,photo } = req.body;

	try {
		const writer = await Writer.create({ name, biography,photo });
		res.status(201).json(writer);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the writer.' });
	}
};

// UPDATE an existing writer
const updateWriter = async (req, res) => {
	const { name, biography,photo } = req.body;

	try {
		const writer = await Writer.findByIdAndUpdate(req.params.id, { name,photo, biography }, { new: true });
		if (!writer) {
			return res.status(404).json({ message: 'Writer not found.' });
		}
		res.json(writer);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while updating the writer.' });
	}
};

// DELETE a writer
const deleteWriter = async (req, res) => {
	try {
		const writer = await Writer.findByIdAndDelete(req.params.id);
		if (!writer) {
			return res.status(404).json({ message: 'Writer not found.' });
		}
		res.json({ message: 'Writer deleted successfully.' });
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while deleting the writer.' });
	}
};

module.exports = {
	getAllWriters,
	getWriterById,
	createWriter,
	updateWriter,
	deleteWriter
};
