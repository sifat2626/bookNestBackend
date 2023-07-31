const Category = require("../models/category");

// GET all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while retrieving categories." });
  }
};

// GET a specific category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while retrieving the category." });
  }
};

// CREATE a new category
const createCategory = async (req, res) => {
  const { name, photo } = req.body;

  try {
    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with the same name already exists." });
    }

    // Create the category if it doesn't already exist
    const category = await Category.create({ name, photo });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const updateCategory = async (req, res) => {
  const { name, photo } = req.body;
	const id = req.params.id;

  try {
    const existingCategory = await Category.findById(id);

    if (existingCategory.name !== name) {
      const existingCategoryCheck = await Category.findOne({ name });
      if (existingCategoryCheck) {
        return res
          .status(400)
          .json({ message: "Category with the same name already exists." });
      }
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, photo },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json(category);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error occurred while updating the category." });
  }
};

// DELETE a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error occurred while deleting the category." });
  }
};

// modified for page and search system
const categoryList = async (req,res)=>{
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
          { name: SearchRgx }
        ]
      };

      data = await Category.aggregate([
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
      data = await Category.aggregate([
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
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryList
 
};
