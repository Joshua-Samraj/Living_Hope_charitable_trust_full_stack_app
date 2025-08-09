import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useData } from '../contexts/DataContext';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';
import { galleryService } from '../services/galleryService';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

const AdminDashboard: React.FC = () => {
  const { galleryImages, galleryLoading, getGalleryImages, refreshGalleryImages } = useData();
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  // Test API connection function
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await api.get('/health');
      console.log('API Health Check Success:', response.data);
      alert('Database connection successful!');
    } catch (error) {
      console.error('API Health Check Failed:', error);
      alert('API connection failed! Check console for details.');
    }
  };

  // Refresh gallery data
  const handleRefresh = async () => {
    try {
      setError('');
      await refreshGalleryImages();
      // Re-initialize expanded categories after refresh
      if (galleryImages.length > 0) {
        const categories = [...new Set(galleryImages.map((img: GalleryImage) => img.category))];
        const initialExpandedState = categories.reduce((acc, category) => {
          acc[category] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedCategories(initialExpandedState);
      }
    } catch (err) {
      console.error('Error refreshing gallery images:', err);
      setError('Failed to refresh images');
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/admin/login');
          return;
        }

        const images = await getGalleryImages();
        
        // Initialize expanded state for all categories
        if (images.length > 0) {
          const categories = [...new Set(images.map((img: GalleryImage) => img.category))];
          const initialExpandedState = categories.reduce((acc, category) => {
            acc[category] = false; // Set to false if you want categories collapsed by default
            return acc;
          }, {} as Record<string, boolean>);

          setExpandedCategories(initialExpandedState);
        }
      } catch (err) {
        console.error('Error loading gallery images:', err);
        setError('Failed to fetch images or not authorized');
      }
    };

    loadImages();
  }, [getGalleryImages, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError('You must be logged in to delete images');
          navigate('/admin/login');
          return;
        }

        // Get auth config with Basic Authentication headers
        const config = createAuthConfig();

        // Delete the image with auth headers
        await api.delete(`/gallery/${id}`, config);
        
        // Refresh the gallery data after deletion
        await refreshGalleryImages();
      } catch (err) {
        setError('Failed to delete image');
        console.error(err);
      }
    }
  };

  const handleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
    
    // Update select all state
    const allImageIds = galleryImages.map((img: GalleryImage) => img._id);
    setSelectAll(allImageIds.every(id => newSelected.has(id)));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedImages(new Set());
      setSelectAll(false);
    } else {
      const allImageIds = galleryImages.map((img: GalleryImage) => img._id);
      setSelectedImages(new Set(allImageIds));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) {
      alert('Please select images to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedImages.size} selected image${selectedImages.size > 1 ? 's' : ''}?`;
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError('You must be logged in to delete images');
          navigate('/admin/login');
          return;
        }

        const imageIds = Array.from(selectedImages);
        
        // Get auth config with Basic Authentication headers
        const config = createAuthConfig();
        
        // Delete multiple images with auth headers
        const response = await api.delete('/gallery/bulk', {
          data: { imageIds },
          ...config
        });
        
        const result = response.data;
        
        // Clear selection
        setSelectedImages(new Set());
        setSelectAll(false);
        
        // Refresh the gallery data after deletion
        await refreshGalleryImages();
        
        alert(result.message);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete images');
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Get unique categories from current gallery images
  const categories = [...new Set(galleryImages.map((img: GalleryImage) => img.category))];

  if (galleryLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="mt-4 text-lg text-gray-600">Loading gallery data...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <div className="text-red-500 mb-4">{error}</div>
      <button
        onClick={handleRefresh}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Gallery Images</h2>
        <div className="space-x-2">
          <button
            onClick={testApiConnection}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Database
          </button>
          <button
            onClick={handleRefresh}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/gallery/upload')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload New Images
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {galleryImages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select All ({galleryImages.length} images)
                </span>
              </label>
              {selectedImages.size > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {selectedImages.size} selected
                </span>
              )}
            </div>
            
            {selectedImages.size > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedImages(new Set());
                    setSelectAll(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded text-sm"
                >
                  {isDeleting ? 'Deleting...' : `Delete Selected (${selectedImages.size})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {categories.length === 0 ? (
        <div className="text-center py-10">No images found. Upload some images to get started.</div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="bg-gray-100 px-4 py-3 cursor-pointer flex justify-between items-center"
                onClick={() => toggleCategory(category)}
              >
                <h3 className="text-xl font-semibold">{category}</h3>
                <span className="text-lg">
                  {expandedCategories[category] ? '−' : '+'}
                </span>
              </div>

              {expandedCategories[category] && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 text-left w-12">
                          <input
                            type="checkbox"
                            checked={galleryImages
                              .filter((img: GalleryImage) => img.category === category)
                              .every((img: GalleryImage) => selectedImages.has(img._id))}
                            onChange={(e) => {
                              const categoryImages = galleryImages.filter((img: GalleryImage) => img.category === category);
                              const newSelected = new Set(selectedImages);
                              
                              if (e.target.checked) {
                                categoryImages.forEach((img: GalleryImage) => newSelected.add(img._id));
                              } else {
                                categoryImages.forEach((img: GalleryImage) => newSelected.delete(img._id));
                              }
                              
                              setSelectedImages(newSelected);
                              const allImageIds = galleryImages.map((img: GalleryImage) => img._id);
                              setSelectAll(allImageIds.every(id => newSelected.has(id)));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="py-2 px-4 text-left">Image</th>
                        <th className="py-2 px-4 text-left">Title</th>
                        <th className="py-2 px-4 text-left">Description</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {galleryImages
                        .filter((img: GalleryImage) => img.category === category)
                        .map((image: GalleryImage) => (
                          <tr 
                            key={image._id} 
                            className={`border-t border-gray-200 hover:bg-gray-50 ${
                              selectedImages.has(image._id) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedImages.has(image._id)}
                                onChange={() => handleImageSelection(image._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <img
                                src={image.url}
                                alt={image.title}
                                className="w-20 h-20 object-cover rounded"
                              />
                            </td>
                            <td className="py-3 px-4">{image.title}</td>
                            <td className="py-3 px-4">{image.description}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/admin/gallery/edit/${image._id}`)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(image._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;