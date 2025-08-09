const Category = require('../models/Category');
const Project = require('../models/Project');
const cacheManager = require('../services/CacheManager');
const { CACHE_KEYS, CACHE_CONFIG } = require('../config/cache');

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const includeProjectCount = req.query.includeProjectCount === 'true';
    const cacheKey = includeProjectCount 
      ? CACHE_KEYS.ALL_CATEGORIES() + ':with-counts'
      : CACHE_KEYS.ALL_CATEGORIES();
    
    // Try to get from cache first
    const cachedCategories = await cacheManager.get(cacheKey);
    if (cachedCategories) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedCategories);
    }
    
    const categories = await Category.find();
    
    let result = categories;
    
    // If includeProjectCount query param is true, add project count to each category
    if (includeProjectCount) {
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
      result = projectCounts;
    }
    
    // Cache the result
    await cacheManager.set(cacheKey, result, CACHE_CONFIG.TTL.CATEGORIES);
    
    res.set('X-Cache', 'MISS');
    res.json(result);
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
    const includeProjects = req.query.includeProjects === 'true';
    const cacheKey = includeProjects
      ? CACHE_KEYS.CATEGORY_BY_KEYWORD(req.params.keyword) + ':with-projects'
      : CACHE_KEYS.CATEGORY_BY_KEYWORD(req.params.keyword);
    
    // Try to get from cache first
    const cachedCategory = await cacheManager.get(cacheKey);
    if (cachedCategory) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedCategory);
    }
    
    const category = await Category.findOne({ keyword: req.params.keyword });
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    let result = category;

    // If includeProjects query param is true, include related projects
    if (includeProjects) {
      const projects = await Project.find({ category: category.keyword });
      result = {
        ...category.toObject(),
        projects
      };
    }

    // Cache the result
    await cacheManager.set(cacheKey, result, CACHE_CONFIG.TTL.CATEGORIES);
    
    res.set('X-Cache', 'MISS');
    res.json(result);
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
    
    // Invalidate categories cache
    await cacheManager.invalidatePattern('categories');
    
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

    // Invalidate categories cache
    await cacheManager.invalidatePattern('categories');

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
    
    // Invalidate categories cache
    await cacheManager.invalidatePattern('categories');
    
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