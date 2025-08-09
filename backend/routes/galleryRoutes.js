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
  deleteMultipleImages,
  upload,
  uploadSingle,
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

// Create new gallery images - supports multiple files (Admin only)
router.post('/', protect, upload, createImage);

// Create a single gallery image (Admin only) - backward compatibility
router.post('/single', protect, uploadSingle, createImage);

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

// Test route for bulk delete (for debugging)
router.get('/bulk/test', (req, res) => {
  res.json({ message: 'Bulk delete route is accessible' });
});

// Delete multiple gallery images (Admin only)
router.delete('/bulk', protect, express.json(), deleteMultipleImages);

// Temporary route without auth for testing
router.delete('/bulk-test', express.json(), deleteMultipleImages);

// Delete a gallery image by ID (Admin only)
router.delete('/:id', protect, deleteImage);





module.exports = router;