const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const { 
  updateBookingStatus, 
  getBookingById, 
  initializePayment, 
  verifyPayment 
} = require('../controllers/bookingController');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  // 1. Get or Create a test user
  let user = await User.findOne({ email: 'testuser@miralounge.com' });
  if (!user) {
    user = new User({
      name: 'Test Customer',
      email: 'testuser@miralounge.com',
      password: 'testpassword123',
      phone: '9876543210'
    });
    await user.save();
    console.log('Created test customer:', user.email);
  }

  // 2. Fetch seeded packages
  const cateringPkg = await Package.findOne({ type: 'Catering' });
  const decoPkg = await Package.findOne({ type: 'Decoration' });
  const addonPkg = await Package.findOne({ type: 'Addon' });

  if (!cateringPkg || !decoPkg) {
    console.error('Packages are not seeded. Please run node scripts/seedPackages.js first!');
    process.exit(1);
  }

  // 3. Create a pending booking (Simulates Booking.jsx booking request)
  const testDate = new Date('2026-11-20T00:00:00.000Z');
  await Booking.deleteMany({ date: testDate });

  const totalCost = (cateringPkg.price * 200) + decoPkg.price + (addonPkg ? addonPkg.price : 0);
  const advancePaid = Math.round(totalCost * 0.25);

  const booking = new Booking({
    user_id: user._id,
    date: testDate,
    guest_count: 200,
    catering_package: cateringPkg._id,
    decoration_package: decoPkg._id,
    addons: addonPkg ? [addonPkg._id] : [],
    total_cost: totalCost,
    advance_paid: advancePaid,
    payment_method: 'Pending',
    payment_status: 'Pending',
    booking_status: 'Pending'
  });

  await booking.save();
  console.log('\n--- STEP 1: Pending Booking Request Created ---');
  console.log('Booking ID:', booking._id);
  console.log('Initial Booking Status:', booking.booking_status);
  console.log('Initial Payment Status:', booking.payment_status);

  // 4. Simulate Admin Approval (Simulates AdminDashboard.jsx click)
  console.log('\n--- STEP 2: Simulating Admin Approval ---');
  const reqApprove = {
    params: { id: booking._id },
    body: { status: 'Approved' }
  };

  const resMock = {
    status: function(code) {
      console.log('HTTP Status Code returned:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON received.');
      return this;
    }
  };

  await updateBookingStatus(reqApprove, resMock);

  // Fetch updated booking state
  let approvedBooking = await Booking.findById(booking._id).populate('user_id');
  console.log('Updated Booking Status in DB:', approvedBooking.booking_status);
  
  if (approvedBooking.booking_status !== 'Approved') {
    console.error('FAILURE: Booking status is not Approved!');
    process.exit(1);
  }

  // 5. Fetch single booking by ID (Simulates Payment.jsx page load)
  console.log('\n--- STEP 3: Simulating Payment Page Details Fetch ---');
  const reqGet = {
    params: { id: booking._id },
    user: { _id: user._id, role: 'user' }
  };
  
  let bookingDetails = null;
  const resGet = {
    json: function(data) {
      bookingDetails = data;
      console.log('Fetched invoice details successfully for:', data.user_id.name);
      console.log('Event Date:', new Date(data.date).toLocaleDateString());
      console.log('Advance payment amount due:', data.advance_paid);
    }
  };
  await getBookingById(reqGet, resGet);

  // 6. Initialize Online Payment (Simulates selecting Razorpay Online and checking out)
  console.log('\n--- STEP 4: Simulating Payment Initialization ---');
  const reqPay = {
    params: { id: booking._id },
    user: { _id: user._id },
    body: { payment_method: 'Online' }
  };

  let rzpOrder = null;
  const resPay = {
    status: function(code) {
      console.log('Payment init error code:', code);
      return this;
    },
    json: function(data) {
      rzpOrder = data.order;
      console.log('Generated Razorpay Order ID:', rzpOrder.id);
      console.log('Razorpay Amount (paisa):', rzpOrder.amount);
    }
  };
  await initializePayment(reqPay, resPay);

  // 7. Verify Payment (Simulates Razorpay Webhook/Handler Signature Verification)
  console.log('\n--- STEP 5: Simulating Razorpay Verification ---');
  // Generates valid HMAC signature to pass verification
  const crypto = require('crypto');
  const razorpay_order_id = rzpOrder.id;
  const razorpay_payment_id = 'pay_dummy_payment_id_12345';
  const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  const signatureData = razorpay_order_id + "|" + razorpay_payment_id;
  const razorpay_signature = crypto.createHmac('sha256', secret)
                                   .update(signatureData)
                                   .digest('hex');

  const reqVerify = {
    params: { id: booking._id },
    body: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    }
  };

  const resVerify = {
    status: function(code) {
      console.log('Verification failed with status:', code);
      return this;
    },
    json: function(data) {
      console.log('Verification Success Response:', data.message);
    }
  };
  await verifyPayment(reqVerify, resVerify);

  // Fetch final booking state
  const finalBooking = await Booking.findById(booking._id);
  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log('Final Booking Status:', finalBooking.booking_status);
  console.log('Final Payment Status:', finalBooking.payment_status);
  console.log('Razorpay Payment ID saved:', finalBooking.razorpay_payment_id);
  
  if (finalBooking.booking_status === 'Approved' && finalBooking.payment_status === 'Completed') {
    console.log('\nSUCCESS: Entire Approve-then-Pay booking lifecycle test passed successfully!');
  } else {
    console.error('\nFAILURE: Final booking state is incorrect!');
  }

  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
