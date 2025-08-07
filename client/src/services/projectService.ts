import api from './api';
import { Project } from '../data/projects';

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get a project by ID
  getProjectById: async (id: string): Promise<Project> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  },

  // Get projects by category
  getProjectsByCategory: async (category: string): Promise<Project[]> => {
    try {
      const response = await api.get(`/projects/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects for category ${category}:`, error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData: Omit<Project, '_id'>): Promise<Project> => {
    console.log('Creating project with data:', projectData);
   
    try {
      const response = await api.post('/projects', projectData);
       console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      
      throw error;
    }
  },

  // Update a project
  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  },
};