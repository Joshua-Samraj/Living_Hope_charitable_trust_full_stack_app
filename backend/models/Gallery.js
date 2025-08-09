const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    required: false // Make URL optional as we'll store image data directly
  },
  imageData: {
    type: Buffer,
    required: false // Will be required if storageType is 'mongodb'
  },
  imageBase64: {
    type: String,
    required: false // Will be required if storageType is 'base64'
  },
  contentType: {
    type: String,
    required: false // Will be required if storageType is 'mongodb' or 'base64'
  },
  thumbUrl: {
    type: String,
    required: false,
    default: null
  },
  mediumUrl: {
    type: String,
    required: false,
    default: null
  },
  deleteUrl: {
    type: String,
    required: false,
    default: null
  },
  storageType: {
    type: String,
    enum: ['local', 'imgbb', 'mongodb', 'base64'],
    default: 'local'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);