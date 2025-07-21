const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/database');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiting');
const { sanitizeInput } = require('./middleware/validation');
const { handleMulterError } = require('./middleware/upload');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for development
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications').router);
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Wavvly API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Wavvly API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user (requires auth)',
        'POST /api/auth/verify-token': 'Verify token (requires auth)'
      },
      users: {
        'GET /api/users/:id': 'Get user profile by ID',
        'GET /api/users/username/:username': 'Get user profile by username',
        'PUT /api/users/profile': 'Update user profile (requires auth)',
        'POST /api/users/:id/follow': 'Follow user (requires auth)',
        'POST /api/users/:id/unfollow': 'Unfollow user (requires auth)',
        'GET /api/users/search/:query': 'Search users',
        'GET /api/users/suggested': 'Get suggested users (requires auth)'
      },
      posts: {
        'GET /api/posts': 'Get all posts (feed)',
        'GET /api/posts/:id': 'Get single post',
        'POST /api/posts': 'Create new post (requires auth)',
        'PUT /api/posts/:id': 'Update post (requires auth)',
        'DELETE /api/posts/:id': 'Delete post (requires auth)',
        'POST /api/posts/:id/like': 'Like/unlike post (requires auth)',
        'POST /api/posts/:id/comment': 'Add comment to post (requires auth)',
        'GET /api/posts/user/:userId': 'Get posts by user'
      },
      upload: {
        'POST /api/upload/avatar': 'Upload user avatar (requires auth)',
        'POST /api/upload/post-images': 'Upload post images (requires auth)'
      }
    }
  });
});

// Multer error handling
app.use(handleMulterError);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: 'Validation Error',
      errors 
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📚 API docs available at: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at: http://localhost:${PORT}/health`);
});

module.exports = app;
