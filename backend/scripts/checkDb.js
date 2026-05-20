const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  
  const users = await User.find({});
  console.log('Users count:', users.length);
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

  const packages = await Package.find({});
  console.log('Packages count:', packages.length);
  packages.forEach(p => console.log(`- [${p.type}] ${p.name} - ₹${p.price}`));

  const bookings = await Booking.find({});
  console.log('Bookings count:', bookings.length);
  bookings.forEach(b => console.log(`- Date: ${b.date}, Status: ${b.booking_status}, Total: ₹${b.total_cost}`));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
