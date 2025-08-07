import React, { useState, useEffect } from 'react';
import { volunteerService } from '../services/volunteerService';
import { donationService, Donation } from '../services/donationService';
import { projectService } from '../services/projectService';
import { categoryService } from '../services/categoryService';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '../data/projects';
import { Category } from '../data/categories';

import imageCompression from 'browser-image-compression';
// Define types for our data
interface Volunteer {
  _id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  location: string;
  aadhaarNumber: string;
  disclaimerAccepted: boolean;
  createdAt: string;
}

interface VolunteerStats {
  totalVolunteers: number;
  locationBreakdown: { _id: string; count: number }[];
  recentRegistrations: number;
  monthlyTrends: { month: string; count: number }[];
}


const handleImageUpload = async (file: File) => {
  console.log("Helle")
  try {
    // Optional: Reject files larger than 5MB before compression
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size should be under 5MB.');
    }

    const options = {
      maxSizeMB: 1.0, // Target compressed size
      maxWidthOrHeight: 1024, // Resize dimension
      useWebWorker: true
    };
    
    const compressedFile = await imageCompression(file, options);
    return await imageToBase64(compressedFile);
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AdminDashboard: React.FC = () => {
  // State for data
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState<boolean>(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form data for projects and categories
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'volunteers' | 'gallery' | 'Donation' | 'projects'>('volunteers');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // For image editing
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch volunteers
        const volunteersData = await volunteerService.getAllVolunteers();
        setVolunteers(volunteersData);
        
        // Generate mock stats data based on volunteers data
        const mockStats: VolunteerStats = {
          totalVolunteers: volunteersData.length,
          locationBreakdown: [
            { _id: "Chennai", count: Math.floor(volunteersData.length * 0.4) },
            { _id: 'Bangalore', count: Math.floor(volunteersData.length * 0.3) },
            { _id: 'Other', count: Math.floor(volunteersData.length * 0.3) },
          ],
          recentRegistrations: Math.floor(volunteersData.length * 0.2),
          monthlyTrends: [
            { month: 'Jan', count: 5 },
            { month: 'Feb', count: 8 },
            { month: 'Mar', count: 12 },
            { month: 'Apr', count: 7 },
            { month: 'May', count: 10 },
          ],
        };
        setVolunteerStats(mockStats);
        
        // Fetch donations
        const donationsData = await donationService.getAllDonations();
        setDonations(donationsData);
        
        // Fetch projects and categories
        const projectsData = await projectService.getAllProjects();
        setProjects(projectsData);
        
        const categoriesData = await categoryService.getAllCategories(true);
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle delete volunteer
  const handleDeleteVolunteer = async (volunteerId: string) => {
    if (window.confirm('Are you sure you want to delete this volunteer application?')) {
      try {
        await volunteerService.deleteVolunteer(volunteerId);
        setVolunteers(volunteers.filter(volunteer => volunteer._id !== volunteerId));
        
        // Update stats after deletion
        if (volunteerStats) {
          setVolunteerStats({
            ...volunteerStats,
            totalVolunteers: volunteerStats.totalVolunteers - 1,
            recentRegistrations: Math.max(0, volunteerStats.recentRegistrations - 1)
          });
        }
      } catch (err) {
        console.error('Error deleting volunteer:', err);
        setError('Failed to delete volunteer. Please try again.'+{err});
      }
    }
  };

  // Handle edit form change
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle project form change
  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle category form change
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  // Open donation modal
  const openDonationModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDonationModal(true);
  };
  
  // Close donation modal
  const closeDonationModal = () => {
    setSelectedDonation(null);
    setShowDonationModal(false);
  };
  
  // Project modal handlers
  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };
  
  const closeProjectModal = () => {
    setSelectedProject(null);
    setShowProjectModal(false);
  };
  
  // Add project modal handlers
  const openAddProjectModal = () => {
    setProjectFormData({
      title: '',
      category: '',
      description: '',
      fullDescription: '',
      status: 'upcoming',
      beneficiaries: '',
      location: '',
      date: '',
      link: ''
    });
    setImageFile(null);
    setShowAddProjectModal(true);
  };
  
  const closeAddProjectModal = () => {
    setShowAddProjectModal(false);
    setProjectFormData({});
    setImageFile(null);
  };
  
  // Add category modal handlers
  const openAddCategoryModal = () => {
    setCategoryFormData({
      name: '',
      keyword: '',
      description: '',
      icon: '🔍',
      color: 'bg-blue-600'
    });
    setImageFile(null);
    setShowAddCategoryModal(true);
  };
  
  const closeAddCategoryModal = () => {
    setShowAddCategoryModal(false);
    setCategoryFormData({});
    setImageFile(null);
  };
  
  // Edit project modal handlers
  const openEditProjectModal = (project: Project) => {
    setSelectedProject(project);
    setProjectFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      fullDescription: project.fullDescription,
      status: project.status,
      beneficiaries: project.beneficiaries,
      location: project.location,
      date: project.date,
      link: project.link
    });
    setShowEditProjectModal(true);
  };
  
  const closeEditProjectModal = () => {
    setShowEditProjectModal(false);
    setSelectedProject(null);
    setProjectFormData({});
    setImageFile(null);
  };
  
  // Edit category modal handlers
  const openEditCategoryModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name,
      keyword: category.keyword,
      description: category.description,
      icon: category.icon,
      color: category.color,
      image: category.image
    });
    setShowEditCategoryModal(true);
  };
  
  const closeEditCategoryModal = () => {
    setShowEditCategoryModal(false);
    setSelectedCategory(null);
    setCategoryFormData({});
    setImageFile(null);
  };
  
  // Handle delete project
const handleDeleteProject = async (projectId: string) => {
  if (window.confirm('Are you sure you want to delete this project?')) {
    try {
      await projectService.deleteProject(projectId); // ✅ pass _id here

      // ✅ filter using _id instead of id
      setProjects(projects.filter(project => project.id !== projectId));
      window.location.reload();
      window.alert('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  }
};

  
  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        setCategories(categories.filter(category => category.id !== categoryId));
        window.alert("Category deleted successfully");
        window.location.reload();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };
  
  // Handle add project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Default placeholder image
      let imageUrl = '/image/logo.jpg';
      
      if (imageFile) {
        try {
          // Convert image to base64 string instead of uploading to cloud
          imageUrl = await handleImageUpload(imageFile);
        } catch (imgErr) {
          console.error('Error converting image to base64:', imgErr);
          // Continue with the placeholder image if conversion fails
        }
      }
      
      // Create the project with the base64 image data
      const newProject = await projectService.createProject({
        ...projectFormData as Omit<Project, '_id'>,
        image: imageUrl,
        id: Date.now().toString() // Temporary ID - the backend will assign a real one
      });
      
      // Update the projects list
      setProjects([...projects, newProject]);
      
      // Close the modal and reset form
      closeAddProjectModal();
      setError('');
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to add project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Default placeholder images
      let imageUrl = '/image/logo.jpg';
      let bannerUrl = '/image/logo.jpg';
      
      if (imageFile) {
        try {
          // Convert image to base64 string instead of uploading to cloud
          imageUrl = await handleImageUpload(imageFile);
          bannerUrl = imageUrl; // Use the same image for banner for now
        } catch (imgErr) {
          console.error('Error converting image to base64:', imgErr);
          // Continue with the placeholder images if conversion fails
        }
      }
      
      // Create the category with the base64 image data
      const newCategory = await categoryService.createCategory({
        ...categoryFormData as Omit<Category, '_id'>,
        image: imageUrl,
        banner: bannerUrl,
        id: Date.now().toString() // Temporary ID - the backend will assign a real one
      });
      
      // Update the categories list
      setCategories([...categories, newCategory]);
      
      // Close the modal and reset form
      closeAddCategoryModal();
      setError('');
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle update project
 const handleUpdateProject = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedProject) return;
  
  try {
    setIsLoading(true);
    
    let imageUrl = selectedProject.image;
    if (imageFile) {
      try {
        imageUrl = await handleImageUpload(imageFile);
      } catch (imgErr) {
        console.error('Image upload error:', imgErr);
      }
    }

    // Ensure all required fields are included
    const updateData = {
      title: projectFormData.title || selectedProject.title,
      category: projectFormData.category || selectedProject.category,
      description: projectFormData.description || selectedProject.description,
      fullDescription: projectFormData.fullDescription || selectedProject.fullDescription,
      status: projectFormData.status || selectedProject.status,
      beneficiaries: projectFormData.beneficiaries || selectedProject.beneficiaries,
      location: projectFormData.location || selectedProject.location,
      date: projectFormData.date || selectedProject.date,
      link: projectFormData.link || selectedProject.link,
      image: imageUrl
    };

    console.log('Updating project with:', updateData);
    
    const updatedProject = await projectService.updateProject(selectedProject._id, updateData);
    
    setProjects(projects.map(project => 
      project._id === selectedProject._id ? updatedProject : project
    ));
    
    closeEditProjectModal();
    setError('');
  } catch (err) {
    console.error('Update error:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    setError(err.response?.data?.message || 'Failed to update project. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  // Handle update category
const handleUpdateCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedCategory) return;
  
  try {
    setIsLoading(true);
    
    let imageUrl = selectedCategory.image;
    let bannerUrl = selectedCategory.banner;
    
    if (imageFile) {
      try {
        imageUrl = await handleImageUpload(imageFile);
        bannerUrl = imageUrl;
      } catch (imgErr) {
        console.error('Image upload error:', imgErr);
      }
    }

    // Ensure all required fields are included
    const updateData = {
      name: categoryFormData.name || selectedCategory.name,
      keyword: categoryFormData.keyword || selectedCategory.keyword,
      description: categoryFormData.description || selectedCategory.description,
      icon: categoryFormData.icon || selectedCategory.icon,
      color: categoryFormData.color || selectedCategory.color,
      image: imageUrl,
      banner: bannerUrl
    };

    console.log('Updating category with:', updateData);
    
    const updatedCategory = await categoryService.updateCategory(selectedCategory._id, updateData);
    
    setCategories(categories.map(category => 
      category._id === selectedCategory._id ? updatedCategory : category
    ));
    
    closeEditCategoryModal();
    setError('');
  } catch (err) {
    console.error('Update error:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    setError(err.response?.data?.message || 'Failed to update category. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Donation Details Modal */}
      {showDonationModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Donation Details</h2>
                <button 
                  onClick={closeDonationModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Donor Name</h3>
                  <p className="text-lg font-medium text-gray-900">{selectedDonation.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <p className="text-lg font-medium text-gray-900">{selectedDonation.phone}</p>
                  {selectedDonation.email && (
                    <p className="text-md text-gray-600">{selectedDonation.email}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Donation Amount</h3>
                  <p className="text-lg font-medium text-gray-900">₹{selectedDonation.amount.toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Donation Frequency</h3>
                  <p className="text-lg font-medium text-gray-900 capitalize">{selectedDonation.frequency}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDonation.categories.map((category, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Donation Date</h3>
                  <p className="text-md text-gray-600">{formatDate(selectedDonation.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage volunteers and gallery images</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'volunteers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('volunteers')}
          >
            Volunteers
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'Donation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('Donation')}
          >
            Donation
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
        </div>
        
        {/* Volunteers Tab Content */}
        {activeTab === 'volunteers' && (
          <div>
            {/* Stats Cards */}
            {volunteerStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Volunteers</h3>
                  <p className="text-3xl font-bold text-gray-900">{volunteerStats.totalVolunteers}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Recent Registrations</h3>
                  <p className="text-3xl font-bold text-gray-900">{volunteerStats.recentRegistrations}</p>
                  <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Top Location</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {volunteerStats.locationBreakdown[0]?._id || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {volunteerStats.locationBreakdown[0]?.count || 0} volunteers
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Monthly Growth</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {volunteerStats.monthlyTrends[volunteerStats.monthlyTrends.length - 1]?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
              </div>
            )}
            
            {/* Volunteers Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Volunteer Registrations</h3>
                <p className="mt-1 text-sm text-gray-500">A list of all volunteers with their details</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {volunteers.length > 0 ? (
                      volunteers.map((volunteer) => (
                        <tr key={volunteer._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{volunteer.age}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{volunteer.phone}</div>
                            <div className="text-sm text-gray-500">{volunteer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{volunteer.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{volunteer.aadhaarNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(volunteer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteVolunteer(volunteer._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete volunteer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No volunteers registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Gallery Tab Content */}
        {activeTab === 'gallery' && (
          <div>
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Gallery Images</h3>
                <p className="mt-1 text-sm text-gray-500">Manage uploaded images</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/admin/gallery/upload')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload New Image
                </button>
                <button
                  onClick={() => navigate('/admin/gallery/edit')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit Image
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Donation' && (
          <div>
            <div className="px-6 py-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Donation Records</h3>
                <p className="mt-1 text-sm text-gray-500">View all donation transactions</p>
              </div>
            </div>
            
            {/* Donation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6 px-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Donations</h3>
                <p className="text-3xl font-bold text-gray-900">{donations.length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Amount</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{donations.reduce((sum, donation) => sum + donation.amount, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Monthly Donations</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {donations.filter(d => d.frequency === 'monthly').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Yearly Donations</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {donations.filter(d => d.frequency === 'yearly').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">One time Donations</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {donations.filter(d => d.frequency === 'one-time').length}
                </p>
              </div>
            </div>
            
            {/* Donation Cards */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {donations.length > 0 ? (
                donations.map((donation) => (
                  <div 
                    key={donation._id} 
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => openDonationModal(donation)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{donation.name}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                          {donation.frequency}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-500 text-sm">Amount</p>
                        <p className="text-xl font-bold text-gray-900">₹{donation.amount.toLocaleString()}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-500 text-sm">Contact</p>
                        <p className="text-gray-700">{donation.phone}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-500 text-sm">Categories</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {donation.categories.slice(0, 2).map((category, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                              {category}
                            </span>
                          ))}
                          {donation.categories.length > 2 && (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                              +{donation.categories.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {formatDate(donation.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No donations recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Projects Tab Content */}
        {activeTab === 'projects' && (
          <div>
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Projects Management</h3>
                <p className="mt-1 text-sm text-gray-500">Manage projects and categories</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={openAddProjectModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add New Project
                </button>
                <button
                  onClick={openAddCategoryModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add New Category
                </button>
              </div>
            </div>
            
            {/* Categories Section */}
            <div className="mt-8 px-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {category.image ? (
                                <img 
                                  src={category.image} 
                                  alt={category.name}
                                  className="w-8 h-8 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  <span className="text-xs text-gray-500">No Image</span>
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{category.keyword}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2">{category.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {category.projectCount || 0} projects
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => openEditCategoryModal(category)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Projects Section */}
            <div className="mt-8 px-6 pb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Projects</h3>
              <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th> */}
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <tr key={project.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img className="h-10 w-10 rounded-full object-cover mr-3" src={project.image} alt={project.title} />
                              <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {categories.find(c => c.keyword === project.category)?.name || project.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.location}</div>
                          </td> */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.date}</div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => openProjectModal(project)}
                            >
                              View
                            </button>
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => openEditProjectModal(project)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Project Modal */}
            {showProjectModal && selectedProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={closeProjectModal}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">{selectedProject.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProject.status === 'active' ? 'bg-green-100 text-green-800' : selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{selectedProject.beneficiaries} beneficiaries</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{selectedProject.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{selectedProject.date}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-700">{selectedProject.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Full Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{selectedProject.fullDescription}</p>
                    </div>
                    
                    {selectedProject.link && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Link</h3>
                        <a 
                          href={selectedProject.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedProject.link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Project Modal */}
            {showAddProjectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">Add New Project</h2>
                      <button 
                        onClick={closeAddProjectModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddProject} className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={projectFormData.title || ''}
                          onChange={handleProjectFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          id="category"
                          name="category"
                          value={projectFormData.category || ''}
                          onChange={handleProjectFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.keyword}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={projectFormData.description || ''}
                          onChange={handleProjectFormChange}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700">Full Description</label>
                        <textarea
                          id="fullDescription"
                          name="fullDescription"
                          value={projectFormData.fullDescription || ''}
                          onChange={handleProjectFormChange}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="status"
                          name="status"
                          value={projectFormData.status || 'upcoming'}
                          onChange={handleProjectFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="upcoming">Upcoming</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="beneficiaries" className="block text-sm font-medium text-gray-700">Beneficiaries</label>
                          <input
                            type="text"
                            id="beneficiaries"
                            name="beneficiaries"
                            value={projectFormData.beneficiaries || ''}
                            onChange={handleProjectFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={projectFormData.location || ''}
                            onChange={handleProjectFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                          <input
                            type="text"
                            id="date"
                            name="date"
                            value={projectFormData.date || ''}
                            onChange={handleProjectFormChange}
                            placeholder="e.g., 2023-05-15 or May 2023"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                          <input
                            type="url"
                            id="link"
                            name="link"
                            value={projectFormData.link || ''}
                            onChange={handleProjectFormChange}
                            placeholder="https://example.com"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Project Image</label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {imageFile && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Preview:</p>
                            <img 
                              src={URL.createObjectURL(imageFile)} 
                              alt="Preview" 
                              className="mt-1 h-32 w-auto object-cover rounded-md" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={closeAddProjectModal}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Project'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Category Modal */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">Add New Category</h2>
                      <button 
                        onClick={closeAddCategoryModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={categoryFormData.name || ''}
                          onChange={handleCategoryFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">Keyword (for URL)</label>
                        <input
                          type="text"
                          id="keyword"
                          name="keyword"
                          value={categoryFormData.keyword || ''}
                          onChange={handleCategoryFormChange}
                          placeholder="e.g., hunger, education"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={categoryFormData.description || ''}
                          onChange={handleCategoryFormChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
                          <input
                            type="text"
                            id="icon"
                            name="icon"
                            value={categoryFormData.icon || ''}
                            onChange={handleCategoryFormChange}
                            placeholder="🔍"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color Class</label>
                          <input
                            type="text"
                            id="color"
                            name="color"
                            value={categoryFormData.color || ''}
                            onChange={handleCategoryFormChange}
                            placeholder="bg-blue-600"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">Category Image</label>
                        <input
                          type="file"
                          id="categoryImage"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {imageFile && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Preview:</p>
                            <img 
                              src={URL.createObjectURL(imageFile)} 
                              alt="Preview" 
                              className="mt-1 h-32 w-auto object-cover rounded-md" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={closeAddCategoryModal}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Category'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Project Modal */}
      {showEditProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Project</h2>
                <button 
                  onClick={closeEditProjectModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Project Title</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={projectFormData.title || ''}
                    onChange={handleProjectFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={projectFormData.category || ''}
                    onChange={handleProjectFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.keyword}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Short Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={projectFormData.description || ''}
                    onChange={handleProjectFormChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-fullDescription" className="block text-sm font-medium text-gray-700">Full Description</label>
                  <textarea
                    id="edit-fullDescription"
                    name="fullDescription"
                    value={projectFormData.fullDescription || ''}
                    onChange={handleProjectFormChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={projectFormData.status || 'upcoming'}
                    onChange={handleProjectFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-beneficiaries" className="block text-sm font-medium text-gray-700">Beneficiaries</label>
                    <input
                      type="text"
                      id="edit-beneficiaries"
                      name="beneficiaries"
                      value={projectFormData.beneficiaries || ''}
                      onChange={handleProjectFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      id="edit-location"
                      name="location"
                      value={projectFormData.location || ''}
                      onChange={handleProjectFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="text"
                      id="edit-date"
                      name="date"
                      value={projectFormData.date || ''}
                      onChange={handleProjectFormChange}
                      placeholder="e.g., 2023-05-15 or May 2023"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-link" className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                    <input
                      type="url"
                      id="edit-link"
                      name="link"
                      value={projectFormData.link || ''}
                      onChange={handleProjectFormChange}
                      placeholder="https://example.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Image</label>
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    className="mt-1 h-32 w-auto object-cover rounded-md" 
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">Change Image (Optional)</label>
                  <input
                    type="file"
                    id="edit-image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">New Image Preview:</p>
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="mt-1 h-32 w-auto object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditProjectModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Update Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Category</h2>
                <button 
                  onClick={closeEditCategoryModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label htmlFor="edit-cat-name" className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    type="text"
                    id="edit-cat-name"
                    name="name"
                    value={categoryFormData.name || ''}
                    onChange={handleCategoryFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-cat-keyword" className="block text-sm font-medium text-gray-700">Keyword (for URL)</label>
                  <input
                    type="text"
                    id="edit-cat-keyword"
                    name="keyword"
                    value={categoryFormData.keyword || ''}
                    onChange={handleCategoryFormChange}
                    placeholder="e.g., hunger, education"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-cat-description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="edit-cat-description"
                    name="description"
                    value={categoryFormData.description || ''}
                    onChange={handleCategoryFormChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-cat-icon" className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
                    <input
                      type="text"
                      id="edit-cat-icon"
                      name="icon"
                      value={categoryFormData.icon || ''}
                      onChange={handleCategoryFormChange}
                      placeholder="🔍"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-cat-color" className="block text-sm font-medium text-gray-700">Color Class</label>
                    <input
                      type="text"
                      id="edit-cat-color"
                      name="color"
                      value={categoryFormData.color || ''}
                      onChange={handleCategoryFormChange}
                      placeholder="bg-blue-600"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Image</label>
                  <img 
                    src={selectedCategory.image} 
                    alt={selectedCategory.name} 
                    className="mt-1 h-32 w-auto object-cover rounded-md" 
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-cat-image" className="block text-sm font-medium text-gray-700">Change Image (Optional)</label>
                  <input
                    type="file"
                    id="edit-cat-image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">New Image Preview:</p>
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="mt-1 h-32 w-auto object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditCategoryModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;