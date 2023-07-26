const Publication = require('../models/publication');
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
	try{
	  const { name, location } = req.fields;

		if(!name?.trim){
			return res.json({ error: "Name is required" });
		}else if(!location?.trim){
			return res.json({ error: "Location is required" });
		}
		const existingPublication = await Publication.findOne({name});
		if(existingPublication){
			res.status(400).json({ message: 'Publication already exists' });
		}
		const publication = await Publication.create({ name, location });

		res.status(201).json(publication);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the publication.' });
	}
};

// UPDATE an existing publication
exports.updatePublication = async (req, res) => {
	const { name, location } = req.body;

	try {
		const publication = await Publication.findByIdAndUpdate(req.params.id, { name, location }, { new: true });
		if (!publication) {
			return res.status(404).json({ message: 'Publication not found.' });
		}
		res.json(publication);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while updating the publication.' });
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


