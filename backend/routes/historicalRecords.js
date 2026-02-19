const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { HistoricalRecord, Document } = require('../models');
const auth = require('../middleware/auth');

// @route   POST /api/historical-records
// @desc    Create historical record
// @access  Private (Editor+)
router.post(
  '/',
  auth.protect,
  auth.restrictTo('super_admin', 'admin', 'editor'),
  [
    body('titleAm').notEmpty().withMessage('Amharic title is required'),
    body('recordType').isIn(['biography', 'land_record', 'cultural_artifact', 'oral_history', 'photograph', 'manuscript']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const record = await HistoricalRecord.create(req.body);
      
      res.status(201).json({
        status: 'success',
        data: {
          record,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating historical record',
      });
    }
  }
);

// @route   GET /api/historical-records
// @desc    Get all historical records
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      recordType,
      era,
      significanceLevel,
      search,
    } = req.query;
    
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');
    
    const whereClause = {};
    
    if (recordType) {
      whereClause.recordType = recordType;
    }
    
    if (era) {
      whereClause.era = era;
    }
    
    if (significanceLevel) {
      whereClause.significanceLevel = significanceLevel;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { titleAm: { [Op.like]: `%${search}%` } },
        { titleEn: { [Op.like]: `%${search}%` } },
        { descriptionAm: { [Op.like]: `%${search}%` } },
        { descriptionEn: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await HistoricalRecord.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Document,
          as: 'Documents',
          attributes: ['id', 'titleAm', 'docId', 'documentType', 'filePath'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        records: rows,
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
      message: 'Error fetching historical records',
    });
  }
});

// @route   GET /api/historical-records/:id
// @desc    Get single historical record
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const record = await HistoricalRecord.findByPk(req.params.id, {
      include: [
        {
          model: Document,
          as: 'Documents',
          attributes: ['id', 'titleAm', 'docId', 'documentType', 'filePath', 'thumbnailPath'],
        },
      ],
    });
    
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Historical record not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        record,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching historical record',
    });
  }
});

// @route   PUT /api/historical-records/:id
// @desc    Update historical record
// @access  Private (Editor+)
router.put('/:id', auth.protect, auth.restrictTo('super_admin', 'admin', 'editor'), async (req, res) => {
  try {
    const record = await HistoricalRecord.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Historical record not found',
      });
    }
    
    await record.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        record,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating historical record',
    });
  }
});

// @route   DELETE /api/historical-records/:id
// @desc    Delete historical record
// @access  Private (Admin+)
router.delete('/:id', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const record = await HistoricalRecord.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Historical record not found',
      });
    }
    
    await record.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'Historical record deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting historical record',
    });
  }
});

module.exports = router;