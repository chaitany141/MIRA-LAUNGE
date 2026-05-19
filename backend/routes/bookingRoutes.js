const express = require('express');
const router = express.Router();
const { createBooking, verifyPayment, getMyBookings, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking).get(protect, getBookings);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id/verify').post(protect, verifyPayment);
router.route('/:id/status').put(protect, updateBookingStatus);

module.exports = router;
