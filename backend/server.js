const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const projectRoutes = require('./routes/projectRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Configure CORS for both development and production
const allowedOrigins = [
  'https://living-hope-charitable-trust-full-s.vercel.app',
  'https://living-hope-charitable-trust.vercel.app',
  'https://living-hope-charitable-trust-full-stack-joshua-samrajs-projects.vercel.app', // Add your actual Vercel production URL
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174' // Add additional local development port
];

app.use(cors({
  origin: function(origin, callback) {
    // Log the origin for debugging
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('No origin, allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.log('CORS error:', msg, 'Origin:', origin);
      return callback(new Error(msg), false);
    }
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Removed conflicting gallery route - handled by galleryRoutes

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

// Test endpoint to verify gallery response format
app.get('/api/test/gallery-format', async (req, res) => {
  try {
    const Gallery = require('./models/Gallery');
    const images = await Gallery.find({}).limit(1);
    
    res.json({
      message: 'Gallery format test',
      sampleCount: images.length,
      isArray: Array.isArray(images),
      sampleData: images.length > 0 ? images[0] : null,
      responseType: typeof images
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});