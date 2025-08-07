console.log('AdminUser.js is being loaded!');
const mongoose = require('mongoose');

const adminUserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to log when a findOne is triggered
adminUserSchema.pre('findOne', function () {
  console.log('[Mongoose] AdminUser: findOne triggered with query:', this.getQuery());
});

// Middleware to log when a find is triggered
adminUserSchema.pre('find', function () {
  console.log('[Mongoose] AdminUser: find triggered with query:', this.getQuery());
});

// Compare password method
adminUserSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;
