import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

const GalleryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data } = await axios.get<GalleryImage>(`/api/gallery/${id}`);
        console.log('Image data:', data);
        
        // Validate the data received
        if (data && typeof data === 'object' && data.title && data.category) {
          setImage(data);
          setFormData({
            title: data.title,
            category: data.category,
            description: data.description || ''
          });
        } else {
          console.error('Invalid image data received:', data);
          setError('Invalid image data received from server');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to fetch image');
        setLoading(false);
      }
    };
    fetchImage();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        setError('You must be logged in to edit images');
        navigate('/admin/login');
        return;
      }
      
      // Get auth config with Basic Authentication headers
      const config = createAuthConfig();
      
      // Update the image with auth headers
      await axios.put(`/api/gallery/${id}`, formData, config);
      navigate('/admin/gallery/edit'); // Redirect after successful update
    } catch (err) {
      setError('Failed to update image');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!image) return <div className="text-center py-10">Image not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Image</h1>
      <div className="flex">
        <div className="w-1/2 pr-4">
          <img src={image.url} alt={image.title} className="w-full h-auto" />
        </div>
        <div className="w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/gallery/edit')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GalleryEdit;