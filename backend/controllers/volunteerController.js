const asyncHandler = require('express-async-handler');
const Volunteer = require('../models/Volunteer');

// @desc    Create new volunteer
// @route   POST /api/volunteers
// @access  Public
const createVolunteer = asyncHandler(async (req, res) => {
  const { name, age, phone, email, location, aadhaarNumber, disclaimerAccepted } = req.body;

  // Validate required fields
  if (!name || !age || !phone || !email || !location || !aadhaarNumber || !disclaimerAccepted) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Validate age
  if (age < 18) {
    res.status(400);
    throw new Error('You must be at least 18 years old to volunteer');
  }

  // Validate phone number (Indian format)
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400);
    throw new Error('Please enter a valid Indian phone number');
  }

  // Validate email
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  // Validate Aadhaar number
  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaarNumber)) {
    res.status(400);
    throw new Error('Please enter a valid 12-digit Aadhaar number');
  }

  // Create volunteer
  const volunteer = await Volunteer.create({
    name,
    age,
    phone,
    email,
    location,
    aadhaarNumber,
    disclaimerAccepted,
  });

  res.status(201).json({
    message: 'Volunteer application submitted successfully',
    volunteer: {
      _id: volunteer._id,
      name: volunteer.name,
      age: volunteer.age,
      phone: volunteer.phone,
      email: volunteer.email,
      location: volunteer.location,
      createdAt: volunteer.createdAt,
    },
  });
});

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Private/Admin
const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await Volunteer.find({}).sort({ createdAt: -1 });
  res.status(200).json(volunteers);
});

// @desc    Get volunteer statistics
// @route   GET /api/volunteers/stats
// @access  Private/Admin
const getVolunteerStats = asyncHandler(async (req, res) => {
  // Get total count
  const totalCount = await Volunteer.countDocuments();
  
  // Get count by location
  const locationStats = await Volunteer.aggregate([
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get recent volunteers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = await Volunteer.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Get monthly registration counts for the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyStats = await Volunteer.aggregate([
    { 
      $match: { 
        createdAt: { $gte: sixMonthsAgo } 
      } 
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  res.status(200).json({
    totalCount,
    recentCount,
    locationStats,
    monthlyStats
  });
});

// @desc    Delete a volunteer by ID
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
const deleteVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);

  if (!volunteer) {
    res.status(404);
    throw new Error('Volunteer not found');
  }

  await volunteer.deleteOne();

  res.status(200).json({ message: 'Volunteer deleted successfully' });
});

module.exports = {
  createVolunteer,
  getVolunteers,
  getVolunteerStats,
  deleteVolunteer,
};


