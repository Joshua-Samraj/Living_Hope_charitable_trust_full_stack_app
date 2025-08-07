const AdminUser = require('../models/AdminUser');

// Simple middleware to check if user is authenticated
const protect = async (req, res, next) => {
  try {
    // Check for admin data in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      const token = req.headers.authorization.split(' ')[1];
      
      // For this simple implementation, we'll just check if the admin exists
      // In a real app, you would verify the token with JWT
      const adminData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (adminData && adminData.id) {
        const admin = await AdminUser.findById(adminData.id);
        if (admin) {
          req.admin = admin;
          return next();
        }
      }
    }
    
    // If no token or invalid token
    res.status(401).json({ message: 'Not authorized, please login' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

module.exports = { protect };