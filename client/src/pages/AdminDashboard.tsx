import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

const AdminDashboard: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/admin/login');
          return;
        }
        
        // Get auth config with Basic Authentication headers
        const config = createAuthConfig();
        
        // Fetch gallery images with auth headers
        const { data } = await api.get('/gallery', config);
        setImages(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch images or not authorized');
        setLoading(false);
        navigate('/admin/login');
      }
    };
    fetchImages();
  }, [navigate]);

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
        setImages(images.filter((image) => image._id !== id));
      } catch (err) {
        setError('Failed to delete image');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-4">Manage Gallery Images</h2>
      <button
        onClick={() => navigate('/admin/gallery/upload')}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Upload New Image
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Image</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image._id}>
                <td className="py-2 px-4 border-b">
                  <img src={image.url} alt={image.title} className="w-20 h-20 object-cover" />
                </td>
                <td className="py-2 px-4 border-b">{image.title}</td>
                <td className="py-2 px-4 border-b">{image.category}</td>
                <td className="py-2 px-4 border-b">{image.description}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => navigate(`/admin/gallery/edit/${image._id}`)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;