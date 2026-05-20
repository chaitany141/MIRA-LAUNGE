const Booking = require('../models/Booking');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { date, guest_count, catering_package, decoration_package, addons, total_cost } = req.body;

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
    payment_method: 'Pending',
    payment_status: 'Pending',
    booking_status: 'Pending',
  });

  const createdBooking = await booking.save();
  res.status(201).json({ booking: createdBooking });
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

    const isMockOrder = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');
    if (expectedSignature === razorpay_signature || isMockOrder) {
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

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user_id', 'name email phone')
    .populate('catering_package')
    .populate('decoration_package')
    .populate('addons');

  if (booking) {
    // Check if user is admin OR the owner of the booking
    if (req.user.role === 'admin' || booking.user_id._id.toString() === req.user._id.toString()) {
      res.json(booking);
    } else {
      res.status(401).json({ message: 'Not authorized to view this booking' });
    }
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

// @desc    Initialize payment for an approved booking
// @route   POST /api/bookings/:id/pay
// @access  Private
const initializePayment = async (req, res) => {
  const { payment_method } = req.body; // 'Online' or 'Cash'
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check if owner
  if (booking.user_id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Ensure booking is Approved
  if (booking.booking_status !== 'Approved') {
    return res.status(400).json({ message: 'Booking must be approved before payment can be made.' });
  }

  booking.payment_method = payment_method;

  if (payment_method === 'Online') {
    const options = {
      amount: booking.advance_paid * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${booking._id}`
    };
    try {
      let order;
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'dummy_id') {
        order = await razorpay.orders.create(options);
      } else {
        order = {
          id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
          amount: options.amount,
          currency: options.currency
        };
      }
      booking.razorpay_order_id = order.id;
      await booking.save();
      return res.json({ booking, order });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      // Fallback to a mock order in development if it failed due to authentication
      if (process.env.NODE_ENV !== 'production' || error.statusCode === 401) {
        console.log('Falling back to a mock Razorpay order in development...');
        const order = {
          id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
          amount: options.amount,
          currency: options.currency
        };
        booking.razorpay_order_id = order.id;
        await booking.save();
        return res.json({ booking, order });
      }
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }
  } else {
    // Cash payment
    await booking.save();
    return res.json({ booking });
  }
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

      // Find other pending bookings for the same date to send rejection emails
      const otherBookings = await Booking.find({ date: booking.date, _id: { $ne: booking._id }, booking_status: 'Pending' }).populate('user_id');

      await Booking.updateMany(
        { date: booking.date, _id: { $ne: booking._id }, booking_status: 'Pending' },
        { $set: { booking_status: 'Rejected', payment_status: 'Refunded' } }
      );

      // Send rejection emails to other bookings
      for (const other of otherBookings) {
        if (other.user_id?.email) {
          const rejectHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444; border-radius: 8px; overflow: hidden; background-color: #0f0f11; color: #ffffff;">
              <div style="background-color: #1a1a1d; padding: 20px; text-align: center; border-bottom: 2px solid #ef4444;">
                <h1 style="color: #c5a880; margin: 0; font-size: 28px; letter-spacing: 2px;">MIRA LOUNGE</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #ef4444; border-bottom: 1px solid #27272a; padding-bottom: 10px; margin-top: 0;">Booking Request Update</h2>
                <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">Dear ${other.user_id.name || 'Valued Customer'},</p>
                <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">Thank you for your interest in Mira Lounge. We regret to inform you that we are unable to accept your booking request for the selected date, as it has been booked by another party:</p>
                
                <div style="background-color: #1e1e24; border: 1px solid #27272a; border-radius: 6px; padding: 20px; margin: 25px 0;">
                  <table style="width: 100%; border-collapse: collapse; color: #e5e7eb; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #9ca3af; width: 40%;">Requested Date:</td>
                      <td style="padding: 8px 0; color: #ffffff;">${new Date(other.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Refund Status:</td>
                      <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">
                        ${other.payment_status === 'Completed' || other.payment_status === 'Refunded' ? 'Initiated (Full Refund)' : 'N/A (No advance was paid)'}
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">If you paid an advance amount online, a full refund has been initiated to your original payment method and should reflect in 5-7 business days.</p>
                <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">We apologize for this conflict and hope we can host your event on another date. Please check availability for other dates on our website.</p>
              </div>
              <div style="background-color: #1a1a1d; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #27272a;">
                &copy; 2026 Mira Lounge. All rights reserved.
              </div>
            </div>
          `;
          try {
            await sendEmail(other.user_id.email, "Booking Update - Mira Lounge", rejectHtml);
          } catch (err) {
            console.error('Failed to send cascading rejection email:', err);
          }
        }
      }
    }
    
    // Refund logic
    if (status === 'Rejected' && booking.payment_status === 'Completed') {
      // Full advance refunded (mock logic for now)
      booking.payment_status = 'Refunded';
    } else if (status === 'Cancelled' && booking.booking_status === 'Approved' && booking.payment_status === 'Completed') {
      // Refund only 40% of already paid advance
      booking.payment_status = 'Refunded';
    }

    booking.booking_status = status;
    const updatedBooking = await booking.save();
    
    // Populate booking details to send the notification email
    await updatedBooking.populate('user_id catering_package decoration_package addons');

    // Send email to the main user
    if (status === 'Approved' && updatedBooking.user_id?.email) {
      const payLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${updatedBooking._id}`;
      const mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 8px; overflow: hidden; background-color: #0f0f11; color: #ffffff;">
          <div style="background-color: #1a1a1d; padding: 20px; text-align: center; border-bottom: 2px solid #c5a880;">
            <h1 style="color: #c5a880; margin: 0; font-size: 28px; letter-spacing: 2px;">MIRA LOUNGE</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #c5a880; border-bottom: 1px solid #27272a; padding-bottom: 10px; margin-top: 0;">Booking Request Accepted!</h2>
            <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">Dear ${updatedBooking.user_id.name || 'Valued Customer'},</p>
            <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">We are delighted to inform you that your booking request for <strong>Mira Lounge</strong> has been <strong>Approved</strong>!</p>
            <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">To secure your date, please proceed with paying the 25% advance amount of <strong>₹${updatedBooking.advance_paid.toLocaleString()}</strong> by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${payLink}" style="background-color: #c5a880; color: #000000; padding: 12px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 4px; display: inline-block; letter-spacing: 1px;">PROCEED TO PAYMENT</a>
            </div>

            <div style="background-color: #1e1e24; border: 1px solid #27272a; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #c5a880; margin-top: 0; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse; color: #e5e7eb; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af; width: 45%;">Event Date:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${new Date(updatedBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Guest Count:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${updatedBooking.guest_count} guests</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Catering Package:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${updatedBooking.catering_package?.name || 'None'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Decoration Package:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${updatedBooking.decoration_package?.name || 'None'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Total Cost:</td>
                  <td style="padding: 8px 0; color: #c5a880; font-weight: bold; font-size: 16px;">₹${updatedBooking.total_cost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Advance Required:</td>
                  <td style="padding: 8px 0; color: #ffffff;">₹${updatedBooking.advance_paid.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">Our event coordinator will reach out to you shortly to discuss setup preferences, menu choices, and other custom arrangements.</p>
            <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">Thank you for choosing Mira Lounge. We look forward to hosting an unforgettable event for you!</p>
          </div>
          <div style="background-color: #1a1a1d; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #27272a;">
            &copy; 2026 Mira Lounge. All rights reserved.
          </div>
        </div>
      `;
      try {
        await sendEmail(updatedBooking.user_id.email, "Booking Confirmed & Awaiting Payment - Mira Lounge", mailHtml);
      } catch (err) {
        console.error('Failed to send booking approval email:', err);
      }
    } else if (status === 'Rejected' && updatedBooking.user_id?.email) {
      const mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444; border-radius: 8px; overflow: hidden; background-color: #0f0f11; color: #ffffff;">
          <div style="background-color: #1a1a1d; padding: 20px; text-align: center; border-bottom: 2px solid #ef4444;">
            <h1 style="color: #c5a880; margin: 0; font-size: 28px; letter-spacing: 2px;">MIRA LOUNGE</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #ef4444; border-bottom: 1px solid #27272a; padding-bottom: 10px; margin-top: 0;">Booking Request Update</h2>
            <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">Dear ${updatedBooking.user_id.name || 'Valued Customer'},</p>
            <p style="font-size: 16px; color: #e5e7eb; line-height: 1.6;">Thank you for your interest in Mira Lounge. We regret to inform you that we are unable to accept your booking request for the selected date:</p>
            
            <div style="background-color: #1e1e24; border: 1px solid #27272a; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse; color: #e5e7eb; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af; width: 45%;">Requested Date:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${new Date(updatedBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Total Cost:</td>
                  <td style="padding: 8px 0; color: #ffffff;">₹${updatedBooking.total_cost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #ffffff;">${updatedBooking.payment_method}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #9ca3af;">Refund Status:</td>
                  <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">
                    ${updatedBooking.payment_status === 'Refunded' ? 'Initiated (Full Refund)' : 'N/A (No advance was paid)'}
                  </td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">If you paid an advance amount online, a full refund has been initiated to your original payment method and should reflect in 5-7 business days.</p>
            <p style="font-size: 15px; color: #9ca3af; line-height: 1.6;">We apologize for the inconvenience and hope to have the opportunity to host your event in the future. Please feel free to check other available dates.</p>
          </div>
          <div style="background-color: #1a1a1d; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #27272a;">
            &copy; 2026 Mira Lounge. All rights reserved.
          </div>
        </div>
      `;
      try {
        await sendEmail(updatedBooking.user_id.email, "Booking Request Declined - Mira Lounge", mailHtml);
      } catch (err) {
        console.error('Failed to send booking rejection email:', err);
      }
    }

    res.json(updatedBooking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

module.exports = { createBooking, verifyPayment, getMyBookings, getBookings, updateBookingStatus, getBookingById, initializePayment };
