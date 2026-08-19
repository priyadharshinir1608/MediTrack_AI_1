const User = require('../models/User');

// Register user metadata in MongoDB after Firebase Auth creates account
const register = async (req, res, next) => {
  try {
    const { firebaseUid, name, email, role, phone } = req.body;

    if (!firebaseUid || !email || !name) {
      return res.status(400).json({ success: false, message: 'firebaseUid, name, and email are required' });
    }

    let user = await User.findOne({ firebaseUid });
    if (user) {
      return res.status(200).json({ success: true, message: 'User already exists', user });
    }

    user = await User.create({
      firebaseUid,
      name,
      email,
      role: role || 'pharmacist',
      phone: phone || ''
    });

    res.status(201).json({ success: true, message: 'User profile created', user });
  } catch (error) {
    next(error);
  }
};

// Sync profile on login
const syncProfile = async (req, res, next) => {
  try {
    const firebaseUid = req.user.firebaseUid;
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        name: req.user.name || 'Pharmacy Staff',
        email: req.user.email,
        role: 'pharmacist'
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Get profile
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, role } = req.body;
    const firebaseUid = req.user.firebaseUid;

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, email: req.user.email });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (role && req.user.role === 'admin') user.role = role;

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  syncProfile,
  getProfile,
  updateProfile
};
