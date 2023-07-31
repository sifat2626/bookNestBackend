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

// modified for page and search system
const writerList = async (req,res)=>{
  try {
    let pageNo = Number(req.params.pageNo) || 1;
    let perPage = Number(req.params.perPage) || 10;
    let searchValue = req.params.searchKeyword;
    let skipRow = (pageNo - 1) * perPage;

    let data;
    if (searchValue !== "0") {
      let SearchRgx = { $regex: searchValue, $options: "i" };
      // search in every possible field
      let SearchQuery = {
        $or: [
          { name: SearchRgx },
         
        ]
      };

      data = await Writer.aggregate([
        {
          $facet: {
            Total: [{ $match: SearchQuery }, { $count: "count" }],
            Rows: [
              { $match: SearchQuery },
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    } else {
      data = await Writer.aggregate([
        {
          $facet: {
            Total: [{ $count: "count" }],
            Rows: [
              { $skip: skipRow },
              { $limit: perPage },
            ],
          },
        },
      ]);
    }
    // console.log('data', data[0].Rows[0]);
    
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(200).json({ status: "fail", error: error });
  }
}

module.exports = {
	getAllWriters,
	getWriterById,
	createWriter,
	updateWriter,
	deleteWriter,
	writerList
};
