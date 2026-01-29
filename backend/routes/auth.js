const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { employeeId, password } = req.body;
      
      // Find user
      const user = await User.findOne({
        where: { employeeId },
      });
      
      // Check if user exists and password is correct
      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid employee ID or password',
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Your account has been deactivated',
        });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate token
      const token = auth.generateToken(user);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error logging in',
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth.protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth.protect, async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error logging out',
    });
  }
});

module.exports = router;