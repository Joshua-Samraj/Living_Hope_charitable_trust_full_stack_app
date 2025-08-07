const Project = require('../models/Project');

/**
 * Get all projects
 * @route GET /api/projects
 * @access Public
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * Get projects by category
 * @route GET /api/projects/category/:keyword
 * @access Public
 */
const getProjectsByCategory = async (req, res, next) => {
  try {
    const projects = await Project.find({ category: req.params.keyword });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private
 */
const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project
 * @route PUT /api/projects/:id
 * @access Private
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject,
};