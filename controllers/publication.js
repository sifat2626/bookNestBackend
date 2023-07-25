const Publication = require('../models/publication');
const fs = require("fs");

// GET all publications
const getAllPublications = async (req, res) => {
	try {
		const publications = await Publication.find();
		res.json(publications);
	} catch (error) {
		res.status(500).json({ message: 'Error occurred while retrieving publications.' });
	}
};

// GET a specific publication by ID
const getPublicationById = async (req, res) => {
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
const createPublication = async (req, res) => {
	try{
	  const { name, location } = req.fields;
	  const {photo} = req.files;

		if(!name?.trim){
			return res.json({ error: "Name is required" });
		}else if(!location?.trim){
			return res.json({ error: "Location is required" });
		}else if(photo && photo.size > 1000000){
		  return res.json({ error: "Image should be less than 1mb in size" });
	  }
		const existingPublication = await Publication.findOne({name});
		if(existingPublication){
			res.status(400).json({ message: 'Publication already exists' });
		}
		const publication = await Publication.create({ name, location });
		if (photo) {
			publication.photo.data = fs.readFileSync(photo.path);
			publication.photo.contentType = photo.type;
		}
		await publication.save();
		res.status(201).json(publication);
	} catch (error) {
		res.status(400).json({ message: 'Error occurred while creating the publication.' });
	}
};

// UPDATE an existing publication
const updatePublication = async (req, res) => {
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
const deletePublication = async (req, res) => {
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


module.exports = {
	getAllPublications,
	getPublicationById,
	createPublication,
	updatePublication,
	deletePublication
};
