const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  guest_count: { type: Number, required: true },
  catering_package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  decoration_package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  addons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  total_cost: { type: Number, required: true },
  advance_paid: { type: Number, required: true },
  payment_method: { type: String, enum: ['Online', 'Cash'], required: true },
  payment_status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  booking_status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
