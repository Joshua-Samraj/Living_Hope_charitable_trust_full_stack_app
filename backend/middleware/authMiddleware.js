const AdminUser = require('../models/AdminUser');

// Simple middleware to check if user is authenticated using basic auth
const protect = async (req, res, next) => {
  try {
    console.log('Auth middleware triggered');
    console.log('Headers:', JSON.stringify(req.headers));
    
    // Check for basic auth header
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic')) {
      console.log('Basic auth header found');
      
      // Get credentials from header
      const base64Credentials = req.headers.authorization.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      
      console.log('Username from auth:', username);
      // Don't log the actual password for security reasons
      console.log('Password provided:', password ? '********' : 'none');
      
      // Find admin by username
      const admin = await AdminUser.findOne({ username });
      console.log('Admin found:', admin ? 'Yes' : 'No');
      
      // Check if admin exists and password matches
      if (admin) {
        const isMatch = await admin.matchPassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        
        if (isMatch) {
          req.admin = admin;
          console.log('Authentication successful');
          return next();
        }
      }
    } else {
      console.log('No Basic auth header found');
    }
    
    // If no auth header or invalid credentials
    console.log('Authentication failed');
    res.status(401).json({ message: 'Not authorized, please login' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

module.exports = { protect };