const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar to Cloudinary
// @access  Private
router.post('/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
          ],
          folder: 'wavvly/avatars'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user's avatar URL in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        joinDate: user.joinDate,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @route   POST /api/upload/post-images
// @desc    Upload images for posts to Cloudinary
// @access  Private
router.post('/post-images', [auth, upload.array('images', 5)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' }
            ],
            folder: 'wavvly/posts'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploaded successfully',
      imageUrls
    });
  } catch (error) {
    console.error('Post images upload error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// @route   GET /api/upload/info
// @desc    Get upload configuration info
// @access  Public
router.get('/info', (req, res) => {
  res.json({
    maxFileSize: '5MB',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5,
    endpoints: {
      avatar: 'POST /api/upload/avatar',
      postImages: 'POST /api/upload/post-images'
    }
  });
});

module.exports = router;