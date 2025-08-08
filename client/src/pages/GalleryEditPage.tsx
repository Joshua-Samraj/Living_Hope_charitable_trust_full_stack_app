import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useData } from '../contexts/DataContext';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';
import { useDebounce } from '../hooks/useDebounce';
import { useImagePreloader } from '../hooks/useImagePreloader';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

// Memoized image row component to prevent unnecessary re-renders
const ImageRow = React.memo(({ 
  image, 
  isSelectionMode, 
  isSelected, 
  onToggleSelection, 
  onEdit, 
  onDelete,
  isImageLoaded
}: {
  image: GalleryImage;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isImageLoaded: (url: string) => boolean;
}) => (
  <tr className={`border-t border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
    {isSelectionMode && (
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(image._id)}
          className="rounded"
        />
      </td>
    )}
    <td className="py-3 px-4">
      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
        {isImageLoaded(image.url) ? (
          <img
            src={image.url}
            alt={image.title}
            className="w-20 h-20 object-cover rounded"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </td>
    <td className="py-3 px-4">{image.title}</td>
    <td className="py-3 px-4">{image.description}</td>
    <td className="py-3 px-4">
      {!isSelectionMode ? (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(image._id)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(image._id)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm"
          >
            Delete
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-500">
          {isSelected ? 'Selected' : 'Not selected'}
        </span>
      )}
    </td>
  </tr>
));

// Memoized category section component
const CategorySection = React.memo(({ 
  category, 
  images, 
  isExpanded, 
  isSelectionMode, 
  selectedImages, 
  onToggleCategory, 
  onSelectAllInCategory, 
  onToggleSelection, 
  onEdit, 
  onDelete 
}: {
  category: string;
  images: GalleryImage[];
  isExpanded: boolean;
  isSelectionMode: boolean;
  selectedImages: Set<string>;
  onToggleCategory: (category: string) => void;
  onSelectAllInCategory: (category: string) => void;
  onToggleSelection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const allCategorySelected = useMemo(() => 
    images.length > 0 && images.every(img => selectedImages.has(img._id)), 
    [images, selectedImages]
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer flex-1"
          onClick={() => onToggleCategory(category)}
        >
          <h3 className="text-xl font-semibold">{category}</h3>
          <span className="text-lg ml-2">
            {isExpanded ? '−' : '+'}
          </span>
          <span className="text-sm text-gray-500 ml-2">({images.length})</span>
        </div>
        
        {isSelectionMode && isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAllInCategory(category);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline ml-4"
          >
            {allCategorySelected ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                {isSelectionMode && (
                  <th className="py-2 px-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allCategorySelected}
                      onChange={() => onSelectAllInCategory(category)}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="py-2 px-4 text-left">Image</th>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <ImageRow
                  key={image._id}
                  image={image}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedImages.has(image._id)}
                  onToggleSelection={onToggleSelection}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isImageLoaded={isImageLoaded}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

const AdminDashboard: React.FC = () => {
  const { galleryImages, galleryLoading, getGalleryImages, refreshGalleryImages } = useData();
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered and categorized images for better performance
  const { categorizedImages, categories, filteredImages } = useMemo(() => {
    // Filter images based on search term
    const filtered = debouncedSearchTerm
      ? galleryImages.filter(img => 
          img.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          img.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          img.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      : galleryImages;

    // Group filtered images by category
    const grouped = filtered.reduce((acc, img) => {
      if (!acc[img.category]) {
        acc[img.category] = [];
      }
      acc[img.category].push(img);
      return acc;
    }, {} as Record<string, GalleryImage[]>);

    return {
      categorizedImages: grouped,
      categories: Object.keys(grouped).sort(),
      filteredImages: filtered
    };
  }, [galleryImages, debouncedSearchTerm]);

  // Preload images for better performance
  const { isImageLoaded } = useImagePreloader({ 
    images: filteredImages, 
    batchSize: 15 
  });

  // Memoized auth config to prevent recreation
  const authConfig = useMemo(() => createAuthConfig(), []);

  // Test API connection function
  const testApiConnection = useCallback(async () => {
    try {
      const response = await api.get('/health');
      alert('Database connection successful!');
    } catch (error) {
      console.error('API Health Check Failed:', error);
      alert('API connection failed! Check console for details.');
    }
  }, []);

  // Refresh gallery data
  const handleRefresh = useCallback(async () => {
    try {
      setError('');
      await refreshGalleryImages();
      // Re-initialize expanded categories after refresh
      if (categories.length > 0) {
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
  }, [refreshGalleryImages, categories]);

  // Initialize expanded categories when images load
  useEffect(() => {
    if (categories.length > 0 && Object.keys(expandedCategories).length === 0) {
      const initialExpandedState = categories.reduce((acc, category) => {
        acc[category] = false;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedCategories(initialExpandedState);
    }
  }, [categories, expandedCategories]);

  // Load images on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/admin/login');
          return;
        }
        await getGalleryImages();
      } catch (err) {
        console.error('Error loading gallery images:', err);
        setError('Failed to fetch images or not authorized');
      }
    };

    loadImages();
  }, [getGalleryImages, navigate]);

  // Single image delete
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        if (!isAuthenticated()) {
          setError('You must be logged in to delete images');
          navigate('/admin/login');
          return;
        }

        await api.delete(`/gallery/${id}`, authConfig);
        await refreshGalleryImages();
      } catch (err) {
        setError('Failed to delete image');
        console.error(err);
      }
    }
  }, [authConfig, navigate, refreshGalleryImages]);

  // Navigate to edit
  const handleEdit = useCallback((id: string) => {
    navigate(`/admin/gallery/edit/${id}`);
  }, [navigate]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedImages(new Set());
  }, []);

  // Handle individual image selection
  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      return newSelected;
    });
  }, []);

  // Select all images in a category
  const selectAllInCategory = useCallback((category: string) => {
    const categoryImages = categorizedImages[category] || [];
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      const allCategorySelected = categoryImages.every(img => newSelected.has(img._id));
      
      if (allCategorySelected) {
        categoryImages.forEach(img => newSelected.delete(img._id));
      } else {
        categoryImages.forEach(img => newSelected.add(img._id));
      }
      
      return newSelected;
    });
  }, [categorizedImages]);

  // Select all filtered images
  const selectAllImages = useCallback(() => {
    setSelectedImages(prev => {
      if (prev.size === filteredImages.length) {
        return new Set();
      } else {
        return new Set(filteredImages.map(img => img._id));
      }
    });
  }, [filteredImages]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Bulk delete selected images
  const handleBulkDelete = useCallback(async () => {
    if (selectedImages.size === 0) {
      alert('Please select images to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedImages.size} selected image${selectedImages.size > 1 ? 's' : ''}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkDeleteLoading(true);
    setError('');

    try {
      if (!isAuthenticated()) {
        setError('You must be logged in to delete images');
        navigate('/admin/login');
        return;
      }

      // Use Promise.allSettled for better error handling
      const deletePromises = Array.from(selectedImages).map(imageId =>
        api.delete(`/gallery/${imageId}`, authConfig)
          .then(() => ({ success: true, imageId }))
          .catch(error => ({ success: false, imageId, error }))
      );

      const results = await Promise.allSettled(deletePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      if (failed > 0) {
        setError(`${failed} out of ${selectedImages.size} images failed to delete`);
      }
      
      if (successful > 0) {
        await refreshGalleryImages();
        if (failed === 0) {
          setSelectedImages(new Set());
          setIsSelectionMode(false);
        }
      }
      
    } catch (err) {
      setError('Failed to delete selected images');
      console.error(err);
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [selectedImages, authConfig, navigate, refreshGalleryImages]);

  // Loading state
  if (galleryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="mt-4 text-lg text-gray-600">Loading gallery data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
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
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Manage Gallery Images ({filteredImages.length}{debouncedSearchTerm ? ` of ${galleryImages.length}` : ''})
        </h2>
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
            onClick={toggleSelectionMode}
            className={`font-bold py-2 px-4 rounded ${
              isSelectionMode 
                ? 'bg-gray-500 hover:bg-gray-700 text-white' 
                : 'bg-orange-500 hover:bg-orange-700 text-white'
            }`}
          >
            {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          <button
            onClick={() => navigate('/admin/gallery/upload')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload New Image
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search images by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllImages}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="space-x-2">
              <button
                onClick={handleBulkDelete}
                disabled={selectedImages.size === 0 || bulkDeleteLoading}
                className="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm"
              >
                {bulkDeleteLoading ? 'Deleting...' : `Delete Selected (${selectedImages.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery content */}
      {categories.length === 0 ? (
        <div className="text-center py-10">No images found. Upload some images to get started.</div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => (
            <CategorySection
              key={category}
              category={category}
              images={categorizedImages[category]}
              isExpanded={expandedCategories[category]}
              isSelectionMode={isSelectionMode}
              selectedImages={selectedImages}
              onToggleCategory={toggleCategory}
              onSelectAllInCategory={selectAllInCategory}
              onToggleSelection={toggleImageSelection}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;