const express = require('express');
const router = express.Router();
const { createBooking, verifyPayment, getMyBookings, getBookings, updateBookingStatus, getBookingById, initializePayment } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking).get(protect, admin, getBookings);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);
router.route('/:id/pay').post(protect, initializePayment);
router.route('/:id/verify').post(protect, verifyPayment);
router.route('/:id/status').put(protect, admin, updateBookingStatus);

module.exports = router;
