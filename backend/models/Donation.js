const mongoose = require('mongoose');

const donationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    email: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    frequency: {
      type: String,
      enum: ['one-time', 'monthly', 'yearly'],
      default: 'one-time',
    },
    categories: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);