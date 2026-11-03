const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    const err = new Error('User already exists');
    err.statusCode = 400;
    throw err;
  }

  user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, user });
});
