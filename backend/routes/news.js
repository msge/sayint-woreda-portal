const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { News, User } = require('../models');
const auth = require('../middleware/auth');

// @route   POST /api/news
// @desc    Create news article
// @access  Private (Editor+)
router.post(
  '/',
  auth.protect,
  auth.restrictTo('super_admin', 'admin', 'editor'),
  [
    body('headlineAm').notEmpty().withMessage('Amharic headline is required'),
    body('contentAm').notEmpty().withMessage('Amharic content is required'),
    body('category').isIn(['announcement', 'event', 'achievement', 'general']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const news = await News.create({
        ...req.body,
        authorId: req.user.id,
        isPublished: req.body.isPublished || false,
        publishedAt: req.body.isPublished ? new Date() : null,
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          news,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating news article',
      });
    }
  }
);

// @route   GET /api/news
// @desc    Get all news articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      isPublished = true,
      search,
    } = req.query;
    
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');
    
    const whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isPublished === 'true') {
      whereClause.isPublished = true;
      whereClause[Op.or] = [
        { publishedAt: { [Op.lte]: new Date() } },
        { publishedAt: null }
      ];
    }
    
    if (search) {
      whereClause[Op.or] = [
        { headlineAm: { [Op.like]: `%${search}%` } },
        { headlineEn: { [Op.like]: `%${search}%` } },
        { contentAm: { [Op.like]: `%${search}%` } },
        { contentEn: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await News.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Author',
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
        news: rows,
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
      message: 'Error fetching news articles',
    });
  }
});

// @route   GET /api/news/:id
// @desc    Get single news article
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['id', 'fullNameAm', 'fullNameEn'],
        },
      ],
    });
    
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News article not found',
      });
    }
    
    // Increment view count
    news.views += 1;
    await news.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching news article',
    });
  }
});

// @route   PUT /api/news/:id
// @desc    Update news article
// @access  Private (Editor+)
router.put('/:id', auth.protect, auth.restrictTo('super_admin', 'admin', 'editor'), async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News article not found',
      });
    }
    
    // Update news
    await news.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating news article',
    });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete news article
// @access  Private (Admin+)
router.delete('/:id', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News article not found',
      });
    }
    
    await news.destroy();
    
    res.status(200).json({
      status: 'success',
      message: 'News article deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting news article',
    });
  }
});

module.exports = router;