require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Category = require('./models/Category');
const AdminUser = require('./models/AdminUser');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/living-hope-trust');
    console.log('Connected to MongoDB for data check');

    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects.`);
    if (projects.length > 0) {
      console.log('First project:', projects[0]);
    }

    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories.`);
    if (categories.length > 0) {
      console.log('First category:', categories[0]);
    }

    const adminUsers = await AdminUser.find({});
    console.log(`Found ${adminUsers.length} admin users.`);
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`Admin user ${index + 1}:`, user);
      });
    }

    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkData();