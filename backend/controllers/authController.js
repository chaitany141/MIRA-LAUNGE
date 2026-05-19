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

module.exports = { authUser, registerUser, getUserProfile, guestLogin };
