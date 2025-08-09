const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Public
const createDonation = asyncHandler(async (req, res) => {
  const { name, phone, email, amount, frequency, categories } = req.body;

  if (!name || !phone || !amount) {
    res.status(400);
    throw new Error('Please add all required fields: name, phone, and amount');
  }

  const donation = await Donation.create({
    name,
    phone,
    email,
    amount,
    frequency,
    categories,
  });

  res.status(201).json(donation);
});

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private/Admin
const getDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({});
  res.status(200).json(donations);
});

module.exports = {
  createDonation,
  getDonations,
};