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

// Compare password method
adminUserSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;