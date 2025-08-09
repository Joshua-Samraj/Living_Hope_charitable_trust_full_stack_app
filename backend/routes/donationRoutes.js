const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createDonation, getDonations } = require('../controllers/donationController');

router.post('/', express.json(), createDonation);
// Get all donations (Admin only)
router.get('/', protect, getDonations);

module.exports = router;