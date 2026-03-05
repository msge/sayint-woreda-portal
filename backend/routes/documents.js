const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Document, User, DocumentVersion } = require('../models');
const auth = require('../middleware/auth');
const { upload, processUpload } = require('../utils/fileUpload');
const path = require('path');

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private (Editor+)
router.post(
  '/upload',
  auth.protect,
  auth.restrictTo('super_admin', 'admin', 'editor'),
  upload.single('file'),
  [
    body('titleAm').notEmpty().withMessage('Amharic title is required'),
    body('category').isIn([
      'historical_record',
      'government_notice',
      'news',
      'biography',
      'administrative',
      'cultural_heritage',
      'form_template'
    ]),
    body('accessLevel').isIn(['public', 'restricted', 'confidential']),
    body('language').isIn(['am', 'en', 'both']),
  ],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded',
        });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Process uploaded file
      const fileInfo = await processUpload(req.file);
      
      // Create document record
      const document = await Document.create({
        titleAm: req.body.titleAm,
        titleEn: req.body.titleEn || null,
        descriptionAm: req.body.descriptionAm || null,
        descriptionEn: req.body.descriptionEn || null,
        category: req.body.category,
        documentType: path.extname(req.file.originalname).substring(1).toLowerCase(),
        filePath: fileInfo.filePath,
        fileSize: fileInfo.fileSize,
        thumbnailPath: fileInfo.thumbnailPath,
        metadata: {
          originalName: fileInfo.originalName,
          mimeType: fileInfo.mimeType,
          ...JSON.parse(req.body.metadata || '{}'),
        },
        language: req.body.language,
        keywords: req.body.keywords ? req.body.keywords.split(',').map(k => k.trim()) : [],
        accessLevel: req.body.accessLevel,
        uploadedBy: req.user.id,
      });
      
      // Create first version
      await DocumentVersion.create({
        documentId: document.id,
        version: 1,
        filePath: fileInfo.filePath,
        changes: 'Initial upload',
        approvedBy: req.user.id,
        approvalDate: new Date(),
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          document,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error uploading document',
      });
    }
  }
);

// @route   GET /api/documents
// @desc    Get all documents (with filtering)
// @access  Private (based on access level)
router.get('/', auth.protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      language,
      accessLevel,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {
      archived: false,
    };
    
    // Filter by category
    if (category) {
      whereClause.category = category;
    }
    
    // Filter by language
    if (language) {
      whereClause.language = language;
    }
    
    // Filter by access level
    if (accessLevel) {
      whereClause.accessLevel = accessLevel;
    }
    
    // Access control: viewers can only see restricted and public
    if (req.user.role === 'viewer') {
      whereClause.accessLevel = ['restricted', 'public'];
    }
    
    // Search functionality
    if (search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { titleAm: { [Op.like]: `%${search}%` } },
        { titleEn: { [Op.like]: `%${search}%` } },
        { descriptionAm: { [Op.like]: `%${search}%` } },
        { descriptionEn: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['id', 'fullNameAm', 'fullNameEn', 'employeeId'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        documents: rows,
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
      message: 'Error fetching documents',
    });
  }
});

// @route   GET /api/documents/public
// @desc    Get public documents (no authentication required)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, language, search } = req.query;
    const offset = (page - 1) * limit;
    
    const { Op } = require('sequelize');
    const whereClause = {
      accessLevel: 'public',
      archived: false,
      [Op.or]: [
        { publishedAt: { [Op.lte]: new Date() } },
        { publishedAt: null }
      ]
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (language) {
      whereClause.language = language;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { titleAm: { [Op.like]: `%${search}%` } },
        { titleEn: { [Op.like]: `%${search}%` } },
        { descriptionAm: { [Op.like]: `%${search}%` } },
        { descriptionEn: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Uploader',
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
        documents: rows,
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
      message: 'Error fetching public documents',
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private (based on access level)
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'Uploader',
          attributes: ['id', 'fullNameAm', 'fullNameEn', 'employeeId'],
        },
        {
          model: DocumentVersion,
          as: 'Versions',
          include: [
            {
              model: User,
              as: 'Approver',
              attributes: ['id', 'fullNameAm', 'fullNameEn'],
            },
          ],
        },
      ],
    });
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Check access permissions
    if (document.accessLevel === 'confidential' && req.user.role === 'viewer') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to confidential document',
      });
    }
    
    // Increment view count
    document.views += 1;
    await document.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching document',
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private (Editor+)
router.put('/:id', auth.protect, auth.restrictTo('super_admin', 'admin', 'editor'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Update document
    await document.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating document',
    });
  }
});
 // @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private (Editor+)
router.post(
  '/upload',
  auth.protect,
  auth.restrictTo('super_admin', 'admin', 'editor'),
  upload.single('file'),
  [
    body('titleAm').notEmpty().withMessage('Amharic title is required'),
    body('category').isIn([
      'historical_record',
      'government_notice',
      'news',
      'biography',
      'administrative',
      'cultural_heritage',
      'form_template'
    ]),
    body('accessLevel').isIn(['public', 'restricted', 'confidential']),
    body('language').isIn(['am', 'en', 'both']),
  ],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded',
        });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Process uploaded file
      const fileInfo = await processUpload(req.file);
      
      // Generate unique document ID
      const { Op } = require('sequelize');
      const year = new Date().getFullYear();
      const count = await Document.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(`${year}-01-01`),
            [Op.lt]: new Date(`${year + 1}-01-01`),
          }
        }
      });
      const docId = `SAY/DOC/${year}/${String(count + 1).padStart(4, '0')}`;
      
      // Parse keywords if they come as JSON string
      let keywords = [];
      if (req.body.keywords) {
        try {
          keywords = JSON.parse(req.body.keywords);
        } catch (e) {
          keywords = req.body.keywords.split(',').map(k => k.trim());
        }
      }
      
      // Create document record
      const document = await Document.create({
        docId,
        titleAm: req.body.titleAm,
        titleEn: req.body.titleEn || null,
        descriptionAm: req.body.descriptionAm || null,
        descriptionEn: req.body.descriptionEn || null,
        category: req.body.category,
        documentType: req.body.documentType || path.extname(req.file.originalname).substring(1).toLowerCase(),
        filePath: fileInfo.filePath,
        fileSize: fileInfo.fileSize,
        thumbnailPath: fileInfo.thumbnailPath,
        metadata: {
          originalName: fileInfo.originalName,
          mimeType: fileInfo.mimeType,
        },
        language: req.body.language,
        keywords: keywords,
        accessLevel: req.body.accessLevel,
        uploadedBy: req.user.id,
      });
      
      // Create first version
      await DocumentVersion.create({
        documentId: document.id,
        version: 1,
        filePath: fileInfo.filePath,
        changes: 'Initial upload',
        approvedBy: req.user.id,
        approvalDate: new Date(),
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          document,
        },
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error uploading document',
      });
    }
  }
);
// @route   DELETE /api/documents/:id
// @desc    Delete/archive document
// @access  Private (Admin+)
router.delete('/:id', auth.protect, auth.restrictTo('super_admin', 'admin'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Soft delete (archive)
    await document.update({ archived: true });
    
    res.status(200).json({
      status: 'success',
      message: 'Document archived successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error archiving document',
    });
  }
});

module.exports = router;