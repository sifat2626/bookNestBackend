const Publication = require('../models/publication');
const cloudinary = require('cloudinary').v2;

const fs = require("fs");

// GET all publications
exports.getAllPublications = async (req, res) => {
	try {
		const publications = await Publication.find();
		res.json(publications);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving publications.' });
	}
};

// GET a specific publication by ID
exports.getPublicationById = async (req, res) => {
	try {
		const publication = await Publication.findById(req.params.id);
		if (!publication) {
			return res.status(404).json({ message: 'Publication not found.' });
		}
		res.json(publication);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving the publication.' });
	}
};

// CREATE a new publication


exports.createPublication = async (req, res) => {
	try {
		const { name, location } = req.fields;
		const { photo } = req.files;

		// Check if a publication with the same name already exists
		const existingPublication = await Publication.findOne({ name });
		if (existingPublication) {
			return res.status(400).json({ message: 'Publication with the same name already exists' });
		}

		// Validate photo size
		if (photo && photo.size > 1000000) {
			return res.status(400).json({ error: 'Image should be less than 1mb in size' });
		}

		// Upload the photo to Cloudinary
		let photoUrl = "https://i.postimg.cc/SxN3MBcH/not-found.png"; // Default photo URL
		if (photo) {
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/publicationPhotos', // Specify the folder in Cloudinary to store publication photos
			});
			photoUrl = result.secure_url;
			console.log('Cloudinary result:', result);
		}

		// Create a new publication object with the Cloudinary photo URL
		const newPublication = new Publication({
			name,
			location,
			photo: photoUrl,
		});

		// Save the new publication to the database
		await newPublication.save();

		res.status(201).json(newPublication);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred while creating the publication' });
	}
};

exports.updatePublication = async (req, res) => {
	try {
		const publicationId = req.params.id;
		const { name, location } = req.fields;
		const { photo } = req.files;

		// Check if the publication with the provided ID exists
		const existingPublication = await Publication.findById(publicationId);
		if (!existingPublication) {
			return res.status(404).json({ message: 'Publication not found' });
		}

		// Update the name and location if provided
		if (name) {
			// Check if a publication with the same name already exists (excluding the current publication being updated)
			const publicationWithSameName = await Publication.findOne({ name, _id: { $ne: publicationId } });
			if (publicationWithSameName) {
				return res.status(400).json({ message: 'Publication with the same name already exists' });
			}
			existingPublication.name = name;
		}
		if (location) {
			existingPublication.location = location;
		}

		// Handle photo update
		if (photo) {
			// Validate photo size
			if (photo.size > 1000000) {
				return res.status(400).json({ error: 'Image should be less than 1mb in size' });
			}

			// Upload the new photo to Cloudinary
			const result = await cloudinary.uploader.upload(photo.path, {
				folder: 'bookNest/publicationPhotos', // Specify the folder in Cloudinary to store publication photos
			});
			existingPublication.photo = result.secure_url;
			console.log('Cloudinary result:', result);
		}

		// Save the updated publication to the database
		await existingPublication.save();

		res.status(200).json(existingPublication);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred while updating the publication' });
	}
};




// DELETE a publication
exports.deletePublication = async (req, res) => {
	try {
		const publication = await Publication.findByIdAndDelete(req.params.id);
		if (!publication) {
			return res.status(404).json({ message: 'Publication not found.' });
		}
		res.json({ message: 'Publication deleted successfully.' });
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while deleting the publication.' });
	}
};


