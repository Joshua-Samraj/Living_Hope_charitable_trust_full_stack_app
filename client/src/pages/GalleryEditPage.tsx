import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useData } from '../contexts/DataContext';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

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
            Upload New Image
          </button>
        </div>
      </div>



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
                          <tr key={image._id} className="border-t border-gray-200 hover:bg-gray-50">
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