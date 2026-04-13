const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Demo Login (Auto-Guest)
// @route   POST /api/auth/demo
const demoLogin = async (req, res) => {
  try {
    // Check if demo user exists, or create one
    let user = await User.findOne({ email: 'guest@cinebook.com' });
    
    if (!user) {
      user = await User.create({
        name: 'Guest User',
        email: 'guest@cinebook.com',
        password: 'hashed_password_placeholder',
        role: 'user'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { demoLogin };
