const Category = require('../models/Category');
const Project = require('../models/Project');

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    
    // If includeProjectCount query param is true, add project count to each category
    if (req.query.includeProjectCount === 'true') {
      // Get project counts for each category
      const projectCounts = await Promise.all(
        categories.map(async (category) => {
          const count = await Project.countDocuments({ category: category.keyword });
          return {
            ...category.toObject(),
            projectCount: count
          };
        })
      );
      return res.json(projectCounts);
    }
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by keyword
 * @route GET /api/categories/:keyword
 * @access Public
 */
const getCategoryByKeyword = async (req, res, next) => {
  try {
    const category = await Category.findOne({ keyword: req.params.keyword });
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    // If includeProjects query param is true, include related projects
    if (req.query.includeProjects === 'true') {
      const projects = await Project.find({ category: category.keyword });
      return res.json({
        ...category.toObject(),
        projects
      });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 * @route POST /api/categories
 * @access Private
 */
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category
 * @route PUT /api/categories/:id
 * @access Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 * @access Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    // Check if there are projects using this category
    const projectCount = await Project.countDocuments({ category: category.keyword });
    if (projectCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete category with ${projectCount} associated projects`);
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryByKeyword,
  createCategory,
  updateCategory,
  deleteCategory,
};