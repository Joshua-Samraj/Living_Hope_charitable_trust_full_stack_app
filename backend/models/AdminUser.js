console.log('AdminUser.js is being loaded!');
const mongoose = require('mongoose');

// Define schema
const adminUserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // Still keep password field for compatibility (optional)
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compare with environment variable
adminUserSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === process.env.ADMIN_PASSWORD;
};

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;
