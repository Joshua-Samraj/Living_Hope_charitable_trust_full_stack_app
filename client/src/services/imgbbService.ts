import axios from 'axios';

// ImgBB API service for image uploads
export const imgbbService = {
  // Upload image to ImgBB
  uploadImage: async (imageFile: File): Promise<string> => {
    try {
      // Create form data for the image upload
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Make API call to backend endpoint that will handle ImgBB upload
      const response = await axios.post('/api/gallery/imgbb-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Return the image URL from the response
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      throw error;
    }
  },
};