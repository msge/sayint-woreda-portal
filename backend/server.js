require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const db = require('./models');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sayintworeda.gov.et'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sayint Woreda Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/news', require('./routes/news'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/historical-records', require('./routes/historicalRecords'));
app.use('/api/contact', require('./routes/contact'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Function to create default admin user
async function createDefaultAdmin() {
  try {
    // Wait a moment for models to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Debug: Check what's in db
    console.log('📊 Available models:', Object.keys(db));
    
    // Get User model - try different access methods
    const User = db.User || db.users || db['User'];
    
    if (!User) {
      console.error('❌ User model not found in db object');
      console.log('📦 Full db object:', db);
      return;
    }
    
    // Check if any user exists
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('👤 No users found. Creating default admin user...');
      
      // Create default admin with plain password (will be hashed by beforeSave hook)
      const admin = await User.create({
        id: uuidv4(),
        employeeId: 'SAY001',
        fullNameAm: 'የአስተዳዳሪ ስም',
        fullNameEn: 'Administrator',
        email: 'admin@sayintworeda.gov.et',
        phone: '+251911234567',
        department: 'Administration',
        role: 'super_admin',
        passwordHash: 'Admin@123', // This will be hashed by the beforeSave hook
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Default admin user created successfully!');
      console.log('📋 Employee ID: SAY001');
      console.log('🔑 Password: Admin@123');
      console.log('👑 Role: super_admin');
      
      // Verify password works
      const testValid = await admin.validatePassword('Admin@123');
      console.log(`🔐 Password validation: ${testValid ? '✅ OK' : '❌ FAILED'}`);
      
    } else {
      console.log(`👥 Found ${userCount} existing user(s) in database.`);
      
      // Check if SAY001 exists
      const adminUser = await User.findOne({ where: { employeeId: 'SAY001' } });
      
      if (adminUser) {
        console.log('🔍 Admin user SAY001 exists. Verifying password...');
        
        // Test if password works
        const testPassword = await adminUser.validatePassword('Admin@123');
        
        if (!testPassword) {
          console.log('⚠️  Admin password is incorrect. Resetting password...');
          
          // Reset password
          adminUser.passwordHash = 'Admin@123'; // Will be hashed by hook
          await adminUser.save();
          
          console.log('✅ Admin password reset successfully!');
          
          // Verify new password
          const testNew = await adminUser.validatePassword('Admin@123');
          console.log(`🔐 New password validation: ${testNew ? '✅ OK' : '❌ FAILED'}`);
        } else {
          console.log('✅ Admin password is correct.');
        }
      } else {
        console.log('⚠️  Admin user SAY001 not found. Creating it...');
        
        // Create admin user
        const admin = await User.create({
          id: uuidv4(),
          employeeId: 'SAY001',
          fullNameAm: 'የአስተዳዳሪ ስም',
          fullNameEn: 'Administrator',
          email: 'admin@sayintworeda.gov.et',
          phone: '+251911234567',
          department: 'Administration',
          role: 'super_admin',
          passwordHash: 'Admin@123',
          isActive: true
        });
        
        console.log('✅ Admin user created successfully!');
        
        // Verify password
        const testValid = await admin.validatePassword('Admin@123');
        console.log(`🔐 Password validation: ${testValid ? '✅ OK' : '❌ FAILED'}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
}

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database - this will create tables if they don't exist
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Syncing database schema...');
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database schema synced successfully.');
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Uploads directory created.');
    }
    
    // Create default admin user if no users exist
    await createDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔑 Default Login: SAY001 / Admin@123`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
