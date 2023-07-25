const Writer = require('../models/writer');

exports.createWriter = async (req,res) => {
	try {
		const {name,biography} = req.body;
		const writer = await Writer.create({name, biography});
		res.status(201).json(writer);
	} catch (error) {
		res.status(400).json({message: 'Error occurred while creating the writer.'});
	}
}

