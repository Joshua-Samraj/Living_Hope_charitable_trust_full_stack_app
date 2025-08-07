const express = require('express');
const { protect } = require('../middleware/authMiddleware');

module.exports = (AdminUser) => {
  const router = express.Router();

  // Admin Login Route
  router.post('/login', express.json(), async (req, res) => {
    const { username, password } = req.body;

    try {
      const admin = await AdminUser.findOne({ username });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      // Generate a fake token here if needed or just send back user info
      res.status(200).json({
        id: admin._id,
        username: admin.username
      });
    } catch (err) {
      console.error('Login Error:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // Admin Profile Route
  router.get('/profile', async (req, res) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }

      res.status(200).json({
        id: req.admin._id,
        username: req.admin.username
      });
    } catch (err) {
      console.error('Profile Error:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  return router;
};
