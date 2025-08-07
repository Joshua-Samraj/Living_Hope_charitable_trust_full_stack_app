const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// Get all projects
router.get('/', getAllProjects);

// Get projects by category - must be before /:id route to avoid conflicts
router.get('/category/:keyword', getProjectsByCategory);

// Get a specific project by ID
router.get('/:id', getProjectById);

// Create a new project
router.post('/', express.json(), createProject);

// Update a project
router.put('/:id', express.json(), updateProject);

// Delete a project
router.delete('/:id', deleteProject);

module.exports = router;