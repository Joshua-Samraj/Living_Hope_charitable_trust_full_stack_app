const asyncHandler = require('express-async-handler');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// @desc    Upload image to ImgBB
// @route   POST /api/gallery/imgbb-upload
// @access  Private/Admin
const uploadToImgBB = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get ImgBB API key from environment variables
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ message: 'ImgBB API key not configured' });
    }

    // Create form data for ImgBB API
    const formData = new FormData();
    formData.append('key', imgbbApiKey);
    
    // Read file as buffer and append to form data
    const fileBuffer = fs.readFileSync(req.file.path);
    formData.append('image', fileBuffer, req.file.originalname);

    // Upload to ImgBB
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: formData.getHeaders(),
    });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    // Return ImgBB response data
    res.json({
      success: true,
      url: response.data.data.url,
      delete_url: response.data.data.delete_url,
      medium: response.data.data.medium?.url || null,
      thumb: response.data.data.thumb?.url || null,
    });
  } catch (error) {
    console.error('ImgBB upload error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

module.exports = {
  uploadToImgBB,
};