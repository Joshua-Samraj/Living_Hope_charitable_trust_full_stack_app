import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useData } from '../contexts/DataContext';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';
import imageCompression from 'browser-image-compression';

const GalleryUploadPage: React.FC = () => {
  const { refreshGalleryImages } = useData();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to Array and store all selected files
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // Function to compress images on the client side
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width or height
      useWebWorker: true,
      fileType: 'image/jpeg' as const
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  };

  // Check if user is authenticated when component mounts
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress('');
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        setError('You must be logged in to upload images');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      if (selectedFiles.length === 0) {
        setError('Please select at least one image');
        setLoading(false);
        return;
      }
      
      setUploadProgress('Compressing images...');
      
      // Compress all selected images
      const compressedFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Compressing image ${i + 1} of ${selectedFiles.length}...`);
        const compressedFile = await compressImage(selectedFiles[i]);
        compressedFiles.push(compressedFile);
      }
      
      setUploadProgress('Uploading images...');
      
      // Create form data with multiple files
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      
      // Append all compressed files
      compressedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      // Get auth config with Basic Authentication headers
      const authConfig = createAuthConfig('multipart/form-data');
      
      // Upload all images to the backend
      const response = await api.post('/gallery', formData, authConfig);
      
      // Refresh gallery cache after successful upload
      await refreshGalleryImages();
      
      setLoading(false);
      setUploadProgress('');
      
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      }
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images');
      setLoading(false);
      setUploadProgress('');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload New Gallery Image</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title:
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category:
          </label>
          <input
            type="text"
            id="category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description:
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUpload">
            Upload Images (Multiple Selection Supported):
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {loading && (
            <div className="mt-2">
              <p className="text-blue-500">Processing images...</p>
              {uploadProgress && <p className="text-sm text-gray-600">{uploadProgress}</p>}
            </div>
          )}
          
          {/* Image Previews */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Selected Images ({selectedFiles.length}):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading || selectedFiles.length === 0}
          >
            {loading ? 'Processing...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryUploadPage;