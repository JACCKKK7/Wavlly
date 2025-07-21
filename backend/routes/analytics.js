const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simple admin check middleware (in production, use proper role-based auth)
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.email === 'admin@wavvly.com' || user.username === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/analytics/overview
// @desc    Get platform overview statistics
// @access  Private (Admin only)
router.get('/overview', [auth, isAdmin], async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalNotifications,
      activeUsersToday,
      postsToday
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Notification.countDocuments(),
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Post.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get user growth over last 7 days
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get post statistics
    const postStats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
          totalShares: { $sum: { $size: '$shares' } },
          avgLikesPerPost: { $avg: { $size: '$likes' } },
          avgCommentsPerPost: { $avg: { $size: '$comments' } }
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalNotifications,
        activeUsersToday,
        postsToday
      },
      userGrowth,
      postStats: postStats[0] || {
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgLikesPerPost: 0,
        avgCommentsPerPost: 0
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private (Admin only)
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    // Top users by followers
    const topUsersByFollowers = await User.aggregate([
      {
        $project: {
          username: 1,
          fullName: 1,
          followerCount: { $size: '$followers' },
          followingCount: { $size: '$following' },
          joinDate: 1
        }
      },
      { $sort: { followerCount: -1 } },
      { $limit: 10 }
    ]);

    // User registration trends
    const registrationTrends = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      topUsersByFollowers,
      registrationTrends
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/posts
// @desc    Get post analytics
// @access  Private (Admin only)
router.get('/posts', [auth, isAdmin], async (req, res) => {
  try {
    // Most liked posts
    const mostLikedPosts = await Post.aggregate([
      {
        $project: {
          content: { $substr: ['$content', 0, 100] },
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' },
          author: 1,
          createdAt: 1
        }
      },
      { $sort: { likeCount: -1 } },
      { $limit: 10 }
    ]);

    // Post creation trends
    const postTrends = await Post.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // Popular hashtags
    const popularHashtags = await Post.aggregate([
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      mostLikedPosts,
      postTrends,
      popularHashtags
    });
  } catch (error) {
    console.error('Get post analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
