const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'You must be at least 18 years old to volunteer']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        // Indian phone number validation (10 digits, optionally with +91 prefix)
        return /^(\+91)?[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    validate: {
      validator: function(v) {
        // Aadhaar number validation (12 digits)
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid Aadhaar number!`
    }
  },
  disclaimerAccepted: {
    type: Boolean,
    required: true,
    default: false,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must accept the disclaimer to proceed'
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);