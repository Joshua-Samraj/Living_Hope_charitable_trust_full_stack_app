const AdminUser = require('../models/AdminUser');

// Simple middleware to check if user is authenticated using basic auth
const protect = async (req, res, next) => {
  try {
    // Check for basic auth header
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic')) {
      // Get credentials from header
      const base64Credentials = req.headers.authorization.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      
      // Find admin by username
      const admin = await AdminUser.findOne({ username });
      
      // Check if admin exists and password matches
      if (admin && await admin.matchPassword(password)) {
        req.admin = admin;
        return next();
      }
    }
    
    // If no auth header or invalid credentials
    res.status(401).json({ message: 'Not authorized, please login' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

module.exports = { protect };