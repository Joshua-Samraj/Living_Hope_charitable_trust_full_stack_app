const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllImages,
  getImagesByCategory,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  upload,
  bufferToBase64,
  extractBase64Data
} = require('../controllers/galleryController');
const { uploadToImgBB } = require('../controllers/imgbbController');

// Get all gallery images
router.get('/', getAllImages);

// Get gallery images by category
router.get('/category/:category', getImagesByCategory);

// Get a specific gallery image by ID
router.get('/:id', getImageById);

// Create a new gallery image (Admin only)
router.post('/', protect, upload, createImage);

// Upload image to ImgBB (Admin only)
router.post('/imgbb-upload', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }
    next();
  });
}, uploadToImgBB);

// Update a gallery image by ID (Admin only)
router.put('/:id', protect, express.json(), updateImage);

// Delete a gallery image by ID (Admin only)
router.delete('/:id', protect, deleteImage);





module.exports = router;