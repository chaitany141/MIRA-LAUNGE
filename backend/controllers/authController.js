const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 8px; overflow: hidden; background-color: #0f0f11; color: #ffffff;">
      <div style="background-color: #1a1a1d; padding: 20px; text-align: center; border-bottom: 2px solid #c5a880;">
        <h1 style="color: #c5a880; margin: 0; font-size: 28px; letter-spacing: 2px;">MIRA LOUNGE</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <p style="font-size: 16px; color: #d1d5db; margin-bottom: 24px;">Please use the following One-Time Password (OTP) to log in to your account:</p>
        <div style="font-size: 36px; font-weight: bold; color: #c5a880; background-color: #1e1e24; border: 1px dashed #c5a880; border-radius: 6px; padding: 15px; display: inline-block; letter-spacing: 5px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #9ca3af; margin-top: 24px;">This code is valid for 5 minutes. Please do not share this OTP with anyone.</p>
      </div>
      <div style="background-color: #1a1a1d; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #27272a;">
        &copy; 2026 Mira Lounge. All rights reserved.
      </div>
    </div>
  `;
  await sendEmail(email, "Your OTP Verification Code - Mira Lounge", html);
};

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

// @desc    Guest login/register without OTP
// @route   POST /api/auth/guest-login
// @access  Public
const guestLogin = async (req, res) => {
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
    res.status(500).json({ message: 'Server error while logging in' });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user && phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required for new users' });
      }
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        phone,
        password: randomPassword
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP
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
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

module.exports = { authUser, registerUser, getUserProfile, guestLogin, sendOtp, verifyOtp };
