const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const ensureUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads');
    await ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and office documents are allowed.'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

// Process uploaded file
const processUpload = async (file, options = {}) => {
  const fileInfo = {
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    thumbnailPath: null,
  };
  
  // Generate thumbnail for images
  if (file.mimetype.startsWith('image/')) {
    const thumbnailName = `thumb_${file.filename.replace(path.extname(file.filename), '.webp')}`;
    const thumbnailPath = path.join(path.dirname(file.path), thumbnailName);
    
    try {
      await sharp(file.path)
        .resize(300, 300, { fit: 'inside' })
        .toFormat('webp')
        .toFile(thumbnailPath);
      
      fileInfo.thumbnailPath = thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    }
  }
  
  return fileInfo;
};

module.exports = {
  upload,
  processUpload,
};