const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  const adminExists = await User.findOne({ email: 'admin@miralounge.com' });
  if (adminExists) {
    console.log('Admin already exists');
    process.exit();
  }
  const admin = new User({
    name: 'Mira Admin',
    email: 'admin@miralounge.com',
    password: 'adminpassword123',
    role: 'admin',
    phone: '9999999999'
  });
  await admin.save();
  console.log('Admin user created successfully');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
