const express = require('express');
const router = express.Router();
const { register, syncProfile, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/sync', verifyToken, syncProfile);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
