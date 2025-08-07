const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
app.use(cors({
  origin: 'https://living-hope-charitable-trust-full-s.vercel.app', // Replace with actual Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false // Optional if using cookies or auth headers
}));
// Import routes
const projectRoutes = require('./routes/projectRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


// Serve static files from the 'image/projects/gallery' directory
app.use('/image/projects/gallery', express.static('image/projects/gallery'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Import Routes
const AdminUser = require('./models/AdminUser');
const adminRoutes = require('./routes/adminRoutes')(AdminUser);
const donationRoutes = require('./routes/donationRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
// Express.js route handler
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.put('/gallery/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid image ID' });
    }

    let updateData = { title, category, description };
    
    // If new image was uploaded
    if (req.file) {
      const imagePath = await processUploadedFile(req.file); // Your file processing function
      updateData.imageUrl = imagePath;
      
      // Optional: Delete old image file
      // fs.unlinkSync(oldImagePath);
    }

    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(updatedImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Use Routes
app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Living Hope Trust API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API server is running properly'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});