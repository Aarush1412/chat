const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user },
  }).select('name email avatar online lastSeen');

  res.json({ success: true, users });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name email avatar online lastSeen'
  );
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, user });
});
