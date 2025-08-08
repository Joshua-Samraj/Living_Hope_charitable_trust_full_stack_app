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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Get the selected file - it will be converted to base64 on the server
      setSelectedFile(e.target.files[0]);
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
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        setError('You must be logged in to upload images');
        setLoading(false);
        navigate('/admin/login');
        return;
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Get auth config with Basic Authentication headers
      // Override Content-Type for multipart/form-data
      const authConfig = createAuthConfig('multipart/form-data');
      
      // The backend will convert the image to base64 text and store it
      await api.post('/gallery', formData, authConfig);
      
      // Refresh gallery cache after successful upload
      await refreshGalleryImages();
      
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to upload image data');
      setLoading(false);
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
            Upload Image:
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {loading && <p className="text-blue-500">Uploading image...</p>}
          {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="mt-4 w-32 h-32 object-cover" />}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading || !selectedFile}
          >
            Upload Image
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