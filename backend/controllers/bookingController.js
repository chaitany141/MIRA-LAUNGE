const Booking = require('../models/Booking');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { date, guest_count, catering_package, decoration_package, addons, total_cost, payment_method } = req.body;

  // Check if date is already approved
  const existingApproved = await Booking.findOne({ date, booking_status: 'Approved' });
  if (existingApproved) {
    return res.status(400).json({ message: 'Date is already booked and approved.' });
  }

  const advance_paid = Math.round(total_cost * 0.25);

  const booking = new Booking({
    user_id: req.user._id,
    date,
    guest_count,
    catering_package,
    decoration_package,
    addons,
    total_cost,
    advance_paid,
    payment_method,
    payment_status: payment_method === 'Cash' ? 'Pending' : 'Pending',
  });

  const createdBooking = await booking.save();

  if (payment_method === 'Online') {
    const options = {
      amount: advance_paid * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${createdBooking._id}`
    };
    try {
      const order = await razorpay.orders.create(options);
      createdBooking.razorpay_order_id = order.id;
      await createdBooking.save();
      return res.status(201).json({ booking: createdBooking, order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }
  } else {
    res.status(201).json({ booking: createdBooking });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/:id/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
                                    .update(body.toString())
                                    .digest('hex');

    if (expectedSignature === razorpay_signature) {
      booking.payment_status = 'Completed';
      booking.razorpay_payment_id = razorpay_payment_id;
      await booking.save();
      res.json({ message: 'Payment verified successfully', booking });
    } else {
      res.status(400).json({ message: 'Invalid signature' });
    }
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user._id }).populate('catering_package decoration_package addons');
  res.json(bookings);
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  const bookings = await Booking.find({}).populate('user_id', 'id name email phone').populate('catering_package decoration_package addons');
  res.json(bookings);
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  const { status } = req.body; // 'Approved', 'Rejected', 'Cancelled'
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    // If approving, reject other pending bookings for the same date
    if (status === 'Approved') {
      const existingApproved = await Booking.findOne({ date: booking.date, booking_status: 'Approved', _id: { $ne: booking._id } });
      if (existingApproved) {
        return res.status(400).json({ message: 'Another booking is already approved for this date.' });
      }
      await Booking.updateMany(
        { date: booking.date, _id: { $ne: booking._id }, booking_status: 'Pending' },
        { $set: { booking_status: 'Rejected', payment_status: 'Refunded' } }
      );
    }
    
    // Refund logic
    if (status === 'Rejected' && booking.payment_status === 'Completed') {
      // Full advance refunded (mock logic for now)
      booking.payment_status = 'Refunded';
    } else if (status === 'Cancelled' && booking.booking_status === 'Approved' && booking.payment_status === 'Completed') {
      // Refund only 40% of already paid advance
      // Real razorpay refund API call would go here
      booking.payment_status = 'Refunded'; // In a real app, track partial refund state
    }

    booking.booking_status = status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

module.exports = { createBooking, verifyPayment, getMyBookings, getBookings, updateBookingStatus };
