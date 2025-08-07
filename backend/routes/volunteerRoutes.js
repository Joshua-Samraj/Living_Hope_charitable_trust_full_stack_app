const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createVolunteer,
  getVolunteers,
  getVolunteerStats,
  deleteVolunteer
} = require('../controllers/volunteerController');

// Submit a new volunteer application
router.post('/', express.json(), createVolunteer);

// Get all volunteers (Admin only)
router.get('/',  getVolunteers);

// Get volunteer statistics (Admin only)
router.get('/stats', protect, getVolunteerStats);
router.delete('/:id', deleteVolunteer);

module.exports = router;