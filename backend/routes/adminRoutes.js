const express = require('express');
module.exports = (AdminUser) => {
  const router = express.Router();



const { protect } = require('../middleware/authMiddleware');

// Admin Login
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

    res.json({ id: admin._id, username: admin.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Admin Profile (Protected Route)
router.get('/profile', protect, async (req, res) => {
  // In a basic auth setup, req.admin would be set by a preceding middleware
  // that authenticates the user (e.g., from session or basic auth headers).
  // For this simplified example, we assume req.admin is populated if authentication succeeds.
  if (req.admin) {
    res.json({ id: req.admin._id, username: req.admin.username });
  } else {
    res.status(401).json({ message: 'Not authorized, admin not found' });
  }
});

  return router;
};