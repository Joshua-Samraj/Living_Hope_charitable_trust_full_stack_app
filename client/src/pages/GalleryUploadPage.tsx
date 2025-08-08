import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useData } from '../contexts/DataContext';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

const GalleryUploadPage: React.FC = () => {
  const { refreshGalleryImages } = useData();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to Array and store all selected files
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
    setUploadProgress({current: 0, total: selectedFiles.length});
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        setError('You must be logged in to upload images');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      if (selectedFiles.length === 0) {
        setError('Please select at least one image to upload');
        setLoading(false);
        return;
      }

      // Get auth config with Basic Authentication headers
      const authConfig = createAuthConfig('multipart/form-data');
      
      // Upload each file separately with the same title, category, and description
      const uploadPromises = selectedFiles.map(async (file, index) => {
        try {
          // Create form data for each file
          const formData = new FormData();
          formData.append('title', title);
          formData.append('category', category);
          formData.append('description', description);
          formData.append('file', file);

          // Upload the file
          await api.post('/gallery', formData, authConfig);
          
          // Update progress
          setUploadProgress(prev => ({...prev, current: prev.current + 1}));
          
          return { success: true, fileName: file.name };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          return { success: false, fileName: file.name, error };
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Check results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        setError(`${failed.length} out of ${selectedFiles.length} images failed to upload: ${failed.map(f => f.fileName).join(', ')}`);
      }
      
      if (successful.length > 0) {
        // Refresh gallery cache after successful uploads
        await refreshGalleryImages();
        
        if (failed.length === 0) {
          // All uploads successful
          navigate('/admin/dashboard');
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to upload images');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Gallery Images</h1>
      
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Multiple Upload:</strong> You can select multiple images at once. All selected images will be uploaded with the same title, category, and description you provide below.
            </p>
          </div>
        </div>
      </div>
      
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
            <div className="mt-4">
              <p className="text-blue-500">Uploading images... ({uploadProgress.current}/{uploadProgress.total})</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {selectedFiles.length > 0 && !loading && (
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
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading || selectedFiles.length === 0}
          >
            {loading ? `Uploading... (${uploadProgress.current}/${uploadProgress.total})` : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
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