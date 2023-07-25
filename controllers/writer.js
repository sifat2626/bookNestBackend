// controllers/writerController.js

const Writer = require('../models/Writer');

// GET all writers
exports.getAllWriters = async (req, res) => {
	try {
		const writers = await Writer.find();
		res.json(writers);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving writers.' });
	}
};

// GET a specific writer by ID
exports.getWriterById = async (req, res) => {
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
exports.createWriter = async (req, res) => {
	const { name, biography } = req.body;

	try {
		const writer = await Writer.create({ name, biography });
		res.status(201).json(writer);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the writer.' });
	}
};

// UPDATE an existing writer
exports.updateWriter = async (req, res) => {
	const { name, biography } = req.body;

	try {
		const writer = await Writer.findByIdAndUpdate(req.params.id, { name, biography }, { new: true });
		if (!writer) {
			return res.status(404).json({ message: 'Writer not found.' });
		}
		res.json(writer);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while updating the writer.' });
	}
};

// DELETE a writer
exports.deleteWriter = async (req, res) => {
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


