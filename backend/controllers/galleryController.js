const multer = require('multer');
const sharp = require('sharp');
const Gallery = require('../models/Gallery'); // Import the Gallery model

// Set up storage for uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for multiple files
});

// Function to compress image using Sharp
const compressImage = async (buffer, quality = 80) => {
  try {
    const compressedBuffer = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toBuffer();
    
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Function to convert Buffer to Base64 string
const bufferToBase64 = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

// Function to extract Base64 data from a data URL
const extractBase64Data = (dataUrl) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      type: matches[1],
      data: matches[2]
    };
  }
  return null;
};

const getAllImages = async (req, res) => {
  try {
    const images = await Gallery.find({});
    
    // Transform the response to include URL for base64 images
    const transformedImages = images.map(image => {
      const imageObj = image.toObject();
      
      // If the image is stored as base64, use it as the URL
      if (image.storageType === 'base64' && image.imageBase64) {
        imageObj.url = image.imageBase64;
      }
      
      return imageObj;
    });
    
    res.json(transformedImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getImagesByCategory = async (req, res) => {
  try {
    const images = await Gallery.find({ category: req.params.category });
    
    // Transform the response to include URL for base64 images
    const transformedImages = images.map(image => {
      const imageObj = image.toObject();
      
      // If the image is stored as base64, use it as the URL
      if (image.storageType === 'base64' && image.imageBase64) {
        imageObj.url = image.imageBase64;
      }
      
      return imageObj;
    });
    
    res.json(transformedImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (image) {
      const imageObj = image.toObject();
      
      // If the image is stored as base64, use it as the URL
      if (image.storageType === 'base64' && image.imageBase64) {
        imageObj.url = image.imageBase64;
      }
      
      res.json(imageObj);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createImage = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const files = req.files; // Get multiple files from the request

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required' });
    }

    const createdImages = [];

    // Process each uploaded file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Compress the image
        const compressedBuffer = await compressImage(file.buffer);
        
        // Convert compressed image buffer to base64 string
        const base64Image = bufferToBase64(compressedBuffer, 'image/jpeg');

        const newImage = new Gallery({
          title,
          category,
          description,
          imageBase64: base64Image, // Store the compressed image as base64 string
          contentType: 'image/jpeg', // Store as JPEG after compression
          storageType: 'base64' // Mark as base64 storage
        });

        const createdImage = await newImage.save();
        
        // Add the image with URL for client display
        const responseImage = {
          ...createdImage.toObject(),
          url: base64Image // Add the base64 data as URL for immediate display
        };
        
        createdImages.push(responseImage);
      } catch (imageError) {
        console.error(`Error processing image ${i + 1}:`, imageError);
        // Continue with other images even if one fails
      }
    }

    if (createdImages.length === 0) {
      return res.status(500).json({ message: 'Failed to process any images' });
    }
    
    res.status(201).json({
      message: `Successfully uploaded ${createdImages.length} out of ${files.length} images`,
      images: createdImages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateImage = async (req, res) => {
  try {
    const { title, category, description, url } = req.body;
    const image = await Gallery.findById(req.params.id);

    if (image) {
      image.title = title || image.title;
      image.category = category || image.category;
      image.description = description || image.description;
      image.url = url || image.url;

      const updatedImage = await image.save();
      res.json(updatedImage);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (image) {
      // Optionally, delete image from Cloudinary if it was uploaded there
      // await cloudinary.uploader.destroy(image.public_id);
      await image.deleteOne();
      res.json({ message: 'Image removed' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMultipleImages = async (req, res) => {
  try {
    console.log('Bulk delete request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      console.log('Invalid imageIds:', imageIds);
      return res.status(400).json({ message: 'Image IDs array is required' });
    }

    console.log('Image IDs to delete:', imageIds);

    // Find all images to be deleted
    const imagesToDelete = await Gallery.find({ _id: { $in: imageIds } });
    console.log('Images found for deletion:', imagesToDelete.length);
    
    if (imagesToDelete.length === 0) {
      return res.status(404).json({ message: 'No images found with provided IDs' });
    }

    // Delete all images
    const deleteResult = await Gallery.deleteMany({ _id: { $in: imageIds } });
    console.log('Delete result:', deleteResult);

    res.json({ 
      message: `Successfully deleted ${deleteResult.deletedCount} images`,
      deletedCount: deleteResult.deletedCount,
      requestedCount: imageIds.length
    });
  } catch (error) {
    console.error('Error in deleteMultipleImages:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllImages,
  getImagesByCategory,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  deleteMultipleImages,
  upload: upload.array('files', 10), // Support up to 10 files
  uploadSingle: upload.single('file'), // Keep single file upload for backward compatibility
  bufferToBase64,
  extractBase64Data,
  compressImage
};