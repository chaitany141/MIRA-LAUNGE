const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const nodemailer = require('nodemailer');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Send OTP for login/booking
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!phone || !name || !email) {
    return res.status(400).json({ message: 'Name, email, and phone are required' });
  }

  try {
    let user = await User.findOne({ email });

    // If user doesn't exist by email, check by phone
    if (!user) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      // Create new user with random password since password is required
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        phone,
        password: randomPassword
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set OTP and expiration (e.g., 10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[EMAIL LOG] Generated OTP for ${email} is ${otp}`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Mira Lounge Booking',
          text: `Your OTP for booking is ${otp}. It is valid for 10 minutes.`,
          html: `<h3>Your Mira Lounge OTP</h3><p>Your OTP for booking is <b style="font-size: 20px; letter-spacing: 2px;">${otp}</b>.</p><p>It is valid for 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log('[EMAIL RESPONSE] OTP email sent successfully');
      } catch (emailError) {
        console.error('[EMAIL SEND ERROR]', emailError);
      }
    }

    // We still return mockOtp for testing purposes if email fails
    res.status(200).json({ message: 'OTP processed', mockOtp: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;

  if ((!email && !phone) || !otp) {
    return res.status(400).json({ message: 'Email/Phone and OTP are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

module.exports = { authUser, registerUser, getUserProfile, sendOtp, verifyOtp };
