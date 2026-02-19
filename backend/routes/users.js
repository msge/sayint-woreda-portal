const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'resetPasswordExpires'] },
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin or self)
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    
    // Allow user to view their own profile or admin to view any
    if (req.user.id !== user.id && !['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this user',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
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

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.post('/', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    // Extract data from request body
    const { 
      employeeId, 
      fullNameAm, 
      fullNameEn, 
      email, 
      phone, 
      department, 
      role,
      password 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { employeeId },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this employee ID or email already exists'
      });
    }
    
    // Create user with password (will be hashed by the beforeSave hook)
    const user = await User.create({
      employeeId,
      fullNameAm,
      fullNameEn,
      email,
      phone,
      department,
      role,
      passwordHash: password // This will trigger the beforeSave hook to hash it
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating user',
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or self)
router.put('/:id', auth.protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    
    // Allow user to update their own profile or admin to update any
    if (req.user.id !== user.id && !['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this user',
      });
    }
    
    // Prevent non-admins from changing role
    if (!['super_admin', 'admin'].includes(req.user.role) && req.body.role) {
      delete req.body.role;
    }
    
    await user.update(req.body);
    
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
      message: 'Error updating user',
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    
    // Prevent self-deletion
    if (req.user.id === user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account',
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user',
    });
  }
});

module.exports = router;