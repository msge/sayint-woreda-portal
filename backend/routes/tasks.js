const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Task, TaskLog, User } = require('../models');
const auth = require('../middleware/auth');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (Editor+)
router.post(
  '/',
  auth.protect,
  auth.restrictTo('super_admin', 'admin', 'editor'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
    body('priority').isIn(['critical', 'high', 'medium', 'low']),
    body('dueDate').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const task = await Task.create({
        ...req.body,
        createdBy: req.user.id,
        status: 'pending',
      });
      
      // Create initial log
      await TaskLog.create({
        taskId: task.id,
        userId: req.user.id,
        action: 'Task Created',
        details: 'Task was created',
        newStatus: 'pending',
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          task,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating task',
      });
    }
  }
);

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', auth.protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      createdBy,
      search,
    } = req.query;
    
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }
    
    if (assignedTo) {
      whereClause.assignedTo = assignedTo;
    }
    
    if (createdBy) {
      whereClause.createdBy = createdBy;
    }
    
    // Non-admins can only see tasks assigned to them or created by them
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      whereClause[Op.or] = [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ];
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Assignee',
          attributes: ['id', 'fullNameAm', 'fullNameEn'],
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'fullNameAm', 'fullNameEn'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        tasks: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks',
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task with logs
// @access  Private
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'Assignee',
          attributes: ['id', 'fullNameAm', 'fullNameEn'],
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'fullNameAm', 'fullNameEn'],
        },
        {
          model: TaskLog,
          as: 'Logs',
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'fullNameAm', 'fullNameEn'],
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }
    
    // Check permissions
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      if (task.assignedTo !== req.user.id && task.createdBy !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this task',
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task',
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth.protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }
    
    // Check permissions
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      if (task.assignedTo !== req.user.id && task.createdBy !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this task',
        });
      }
    }
    
    const oldStatus = task.status;
    
    // Update task
    await task.update(req.body);
    
    // Create log if status changed
    if (oldStatus !== task.status) {
      await TaskLog.create({
        taskId: task.id,
        userId: req.user.id,
        action: 'Status Updated',
        details: req.body.details || 'Status was updated',
        oldStatus,
        newStatus: task.status,
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating task',
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin+)
router.delete('/:id', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }
    
    await task.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task',
    });
  }
});

module.exports = router;