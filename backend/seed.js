const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import models
const Project = require('./models/Project');
const Category = require('./models/Category');
const Gallery = require('./models/Gallery');
const AdminUser = require('./models/AdminUser');


// Improved file reading function with better error handling


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/living-hope-trust', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => {
  console.error('Could not connect to MongoDB', err);
  process.exit(1);
});

// Improved seed function with transaction support
const seedDatabase = async () => {


  try {
    console.log('Starting database seeding...');

    // Clear existing admin users to re-seed with updated logic
    await AdminUser.deleteMany({});
    console.log('Existing admin users cleared.');





    // Seed admin user only if doesn't exist
    // Seed first admin user
    const adminUsername1 = process.env.ADMIN_USERNAME || 'admin';
    const existingAdmin1 = await AdminUser.findOne({ username: adminUsername1 });
    
    if (!existingAdmin1) {
      const adminPassword1 = process.env.ADMIN_PASSWORD || 'password';
      const hashedPassword1 = adminPassword1;
      const adminUser1 = new AdminUser({
        username: adminUsername1,
        password: hashedPassword1,
      });
      await adminUser1.save();
      console.log('First admin user seeded');
    } else {
      console.log('First admin user already exists - skipping');
    }
    
    // Seed second admin user
    const adminUsername2 = 'admin';
    const existingAdmin2 = await AdminUser.findOne({ username: adminUsername2 });
    
    if (!existingAdmin2) {
      const adminPassword2 = 'admin123';
      const hashedPassword2 = adminPassword2;
      const adminUser2 = new AdminUser({
        username: adminUsername2,
        password: hashedPassword2,
      });
      await adminUser2.save();
      console.log('Second admin user seeded');
    } else {
      console.log('Second admin user already exists - skipping');
    }


    console.log('Database seeded successfully!');
  } catch (error) {

    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase();