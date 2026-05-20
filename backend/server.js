const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Global JSON Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


// Basic Route
app.get('/', (req, res) => {
  res.send('Mira Lounge API is running...');
});
