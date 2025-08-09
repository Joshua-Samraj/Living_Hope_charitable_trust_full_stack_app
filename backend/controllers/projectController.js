const Project = require('../models/Project');
const cacheManager = require('../services/CacheManager');
const { CACHE_KEYS, CACHE_CONFIG } = require('../config/cache');

/**
 * Get all projects
 * @route GET /api/projects
 * @access Public
 */
const getAllProjects = async (req, res, next) => {
  try {
    const cacheKey = CACHE_KEYS.ALL_PROJECTS();
    
    // Try to get from cache first
    const cachedProjects = await cacheManager.get(cacheKey);
    if (cachedProjects) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedProjects);
    }
    
    // Fetch from database
    const projects = await Project.find();
    
    // Cache the result
    await cacheManager.set(cacheKey, projects, CACHE_CONFIG.TTL.PROJECTS);
    
    res.set('X-Cache', 'MISS');
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
    const cacheKey = CACHE_KEYS.PROJECT_BY_ID(req.params.id);
    
    // Try to get from cache first
    const cachedProject = await cacheManager.get(cacheKey);
    if (cachedProject) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedProject);
    }
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    
    // Cache the result
    await cacheManager.set(cacheKey, project, CACHE_CONFIG.TTL.PROJECT_BY_ID);
    
    res.set('X-Cache', 'MISS');
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
    const cacheKey = CACHE_KEYS.PROJECTS_BY_CATEGORY(req.params.keyword);
    
    // Try to get from cache first
    const cachedProjects = await cacheManager.get(cacheKey);
    if (cachedProjects) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedProjects);
    }
    
    const projects = await Project.find({ category: req.params.keyword });
    
    // Cache the result
    await cacheManager.set(cacheKey, projects, CACHE_CONFIG.TTL.PROJECTS_BY_CATEGORY);
    
    res.set('X-Cache', 'MISS');
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
    
    // Invalidate related cache entries
    await cacheManager.invalidatePattern('projects');
    
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

    // Invalidate related cache entries
    await cacheManager.invalidatePattern('projects');

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
    
    // Invalidate related cache entries
    await cacheManager.invalidatePattern('projects');
    
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