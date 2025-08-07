const multer = require('multer');
const Gallery = require('../models/Gallery'); // Import the Gallery model

// Set up storage for uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
    const file = req.file; // Get the file from the request

    if (!file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Convert image buffer to base64 string
    const base64Image = bufferToBase64(file.buffer, file.mimetype);

    const newImage = new Gallery({
      title,
      category,
      description,
      imageBase64: base64Image, // Store the image as base64 string
      contentType: file.mimetype, // Store the content type
      storageType: 'base64' // Mark as base64 storage
    });

    const createdImage = await newImage.save();
    
    // Return the image with URL for client display
    const responseImage = {
      ...createdImage.toObject(),
      url: base64Image // Add the base64 data as URL for immediate display
    };
    
    res.status(201).json(responseImage);
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

module.exports = {
  getAllImages,
  getImagesByCategory,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  upload: upload.single('file'),
  bufferToBase64,
  extractBase64Data
};