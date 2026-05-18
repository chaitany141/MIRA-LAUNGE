const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
    let user = await User.findOne({ phone });

    // If user doesn't exist by phone, check by email
    if (!user) {
      user = await User.findOne({ email });
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (e.g., 10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[MSG91 LOG] Generated OTP for ${phone} is ${otp}`);

    if (process.env.MSG91_AUTH_KEY) {
      try {
        // Format phone number to include country code '91' if it's a 10 digit Indian number
        const formattedPhone = phone.length === 10 ? `91${phone}` : phone.replace(/[^0-9]/g, '');
        
        let msg91Url = `https://control.msg91.com/api/v5/otp?mobile=${formattedPhone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}`;
        
        // Add template_id if provided in .env
        if (process.env.MSG91_TEMPLATE_ID) {
          msg91Url += `&template_id=${process.env.MSG91_TEMPLATE_ID}`;
        }

        const msg91Response = await fetch(msg91Url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ OTP: otp, otp: otp })
        });

        const msg91Data = await msg91Response.json();
        console.log('[MSG91 RESPONSE]', msg91Data);
        
        if (msg91Data.type === 'error') {
          console.error('[MSG91 ERROR]', msg91Data.message);
        }
      } catch (smsError) {
        console.error('[MSG91 FETCH ERROR]', smsError);
      }
    }

    // We still return mockOtp for testing purposes if SMS fails
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
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  try {
    const user = await User.findOne({ phone });

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
