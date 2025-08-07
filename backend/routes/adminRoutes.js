const express = require('express');
const { protect } = require('../middleware/authMiddleware');

module.exports = (AdminUser) => {
  const router = express.Router();

  // Admin Login Route - Simple username/password check against MongoDB
  router.post('/login', express.json(), async (req, res) => {
    const { username, password } = req.body;

    try {
      // Find admin by username
      const admin = await AdminUser.findOne({ username });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid Username' });
      }

      // Check if password matches
      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Password' });
      }

      // Return basic admin info on successful login
      res.status(200).json({
        id: admin._id,
        username: admin.username,
        message: 'Login successful'
      });
    } catch (err) {
      console.error('Login Error:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // Admin Profile Route - Protected with basic auth
  router.get('/profile', protect, async (req, res) => {
    try {
      // req.admin is set by the protect middleware if authentication is successful
      res.status(200).json({
        id: req.admin._id,
        username: req.admin.username,
        message: 'Profile retrieved successfully'
      });
    } catch (err) {
      console.error('Profile Error:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  return router;
};
