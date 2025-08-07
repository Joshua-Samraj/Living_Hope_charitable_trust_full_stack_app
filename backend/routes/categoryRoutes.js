const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryByKeyword,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Get all categories
router.get('/', getAllCategories);

// Get a specific category by keyword
router.get('/:keyword', getCategoryByKeyword);

// Create a new category
router.post('/', express.json(), createCategory);

// Update a category
router.put('/:id', express.json(), updateCategory);

// Delete a category
router.delete('/:id', express.json(), deleteCategory);

module.exports = router;