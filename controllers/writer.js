// controllers/writerController.js

const Writer = require('../models/writer');
const cloudinary = require('cloudinary').v2;

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

exports.createWriter = async (req, res) => {
	try {
		const { name, biography } = req.fields;
		const { photo } = req.files;

		// Check if a writer with the same name already exists
		const existingWriter = await Writer.findOne({ name });
		if (existingWriter) {
			return res.status(400).json({ message: 'Writer with the same name already exists' });
		}

		// Validate photo size
		if (photo && photo.size > 1000000) {
			return res.status(400).json({ error: 'Image should be less than 1mb in size' });
		}

		// Upload the photo to Cloudinary
		let photoUrl = "https://i.postimg.cc/SxN3MBcH/not-found.png"; // Default photo URL
		if (photo) {
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/writerPhotos', // Specify the folder in Cloudinary to store writer photos
			});
			photoUrl = result.secure_url;
			console.log('Cloudinary result:', result);
		}

		// Create a new writer object with the Cloudinary photo URL
		const newWriter = new Writer({
			name,
			biography,
			photo: photoUrl,
		});

		// Save the new writer to the database
		await newWriter.save();

		res.status(201).json(newWriter);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred while creating the writer' });
	}
};

// Update an existing writer
exports.updateWriter = async (req, res) => {
	try {
		const writerId = req.params.id;
		const { name, biography } = req.fields;
		const { photo } = req.files;

		// Check if the writer with the provided ID exists
		const existingWriter = await Writer.findById(writerId);
		if (!existingWriter) {
			return res.status(404).json({ message: 'Writer not found' });
		}

		// Update the name and biography if provided
		if (name) {
			// Check if a writer with the same name already exists (excluding the current writer being updated)
			const writerWithSameName = await Writer.findOne({ name, _id: { $ne: writerId } });
			if (writerWithSameName) {
				return res.status(400).json({ message: 'Writer with the same name already exists' });
			}
			existingWriter.name = name;
		}
		if (biography) {
			existingWriter.biography = biography;
		}

		// Handle photo update
		if (photo) {
			// Validate photo size
			if (photo.size > 1000000) {
				return res.status(400).json({ error: 'Image should be less than 1mb in size' });
			}

			// Upload the new photo to Cloudinary
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/writerPhotos', // Specify the folder in Cloudinary to store writer photos
			});
			existingWriter.photo = result.secure_url;
			console.log('Cloudinary result:', result);
		}

		// Save the updated writer to the database
		await existingWriter.save();

		res.status(200).json(existingWriter);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred while updating the writer' });
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


