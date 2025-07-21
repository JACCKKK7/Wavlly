const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Public (but better experience with auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If user is authenticated, prioritize posts from people they follow
    if (req.user) {
      const user = await User.findById(req.user.id);
      query = {
        $or: [
          { author: { $in: user.following } },
          { author: user._id }
        ]
      };
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar isVerified')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // If authenticated user didn't get enough posts, fill with general posts
    if (req.user && posts.length < limit) {
      const remainingLimit = limit - posts.length;
      const excludeIds = posts.map(post => post._id);
      
      const additionalPosts = await Post.find({
        _id: { $nin: excludeIds }
      })
        .populate('author', 'username fullName avatar isVerified')
        .populate('comments.user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(remainingLimit);
      
      posts.push(...additionalPosts);
    }

    // Transform posts for frontend
    const transformedPosts = posts.map(post => ({
      id: post._id.toString(),
      author: {
        id: post.author._id.toString(),
        username: post.author.username,
        fullName: post.author.fullName,
        avatar: post.author.avatar,
        isVerified: post.author.isVerified || false
      },
      content: post.content,
      image: post.images && post.images.length > 0 ? post.images[0] : null,
      likes: post.likes ? post.likes.length : 0,
      comments: post.comments ? post.comments.length : 0,
      isLiked: req.user ? post.likes.some(like => like.user.toString() === req.user.id) : false,
      createdAt: post.createdAt
    }));

    res.json({
      posts: transformedPosts,
      currentPage: page,
      hasMore: posts.length === limit
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar isVerified')
      .populate('comments.user', 'username fullName avatar')
      .populate('likes.user', 'username fullName avatar')
      .populate('shares.user', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  auth,
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Post content must be between 1 and 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, images } = req.body;

    // Extract hashtags and mentions
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    const mentionMatches = content.match(/@[a-zA-Z0-9_]+/g) || [];
    
    // Find mentioned users
    const mentions = [];
    for (const mention of mentionMatches) {
      const username = mention.substring(1);
      const user = await User.findOne({ username });
      if (user) {
        mentions.push(user._id);
      }
    }

    const newPost = new Post({
      author: req.user.id,
      content,
      images: images || [],
      hashtags: hashtags.map(tag => tag.substring(1).toLowerCase()),
      mentions
    });

    await newPost.save();

    // Populate the post before sending response
    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username fullName avatar isVerified')
      .populate('mentions', 'username fullName');

    // Transform post for frontend
    const transformedPost = {
      id: populatedPost._id.toString(),
      author: {
        id: populatedPost.author._id.toString(),
        username: populatedPost.author.username,
        fullName: populatedPost.author.fullName,
        avatar: populatedPost.author.avatar,
        isVerified: populatedPost.author.isVerified || false
      },
      content: populatedPost.content,
      image: populatedPost.images && populatedPost.images.length > 0 ? populatedPost.images[0] : null,
      likes: populatedPost.likes ? populatedPost.likes.length : 0,
      comments: populatedPost.comments ? populatedPost.comments.length : 0,
      isLiked: false, // New post, so not liked yet
      createdAt: populatedPost.createdAt
    };

    res.status(201).json(transformedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', [
  auth,
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Post content must be between 1 and 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { content } = req.body;

    // Extract hashtags and mentions
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    const mentionMatches = content.match(/@[a-zA-Z0-9_]+/g) || [];
    
    // Find mentioned users
    const mentions = [];
    for (const mention of mentionMatches) {
      const username = mention.substring(1);
      const user = await User.findOne({ username });
      if (user) {
        mentions.push(user._id);
      }
    }

    post.content = content;
    post.hashtags = hashtags.map(tag => tag.substring(1).toLowerCase());
    post.mentions = mentions;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username fullName avatar isVerified')
      .populate('mentions', 'username fullName');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'fullName');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post is already liked by user
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      
      res.json({ 
        isLiked: false,
        likes: post.likes.length
      });
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
      await post.save();

      // Create notification for the post author (if not liking own post)
      if (post.author._id.toString() !== req.user.id) {
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        const currentUser = await User.findById(req.user.id);
        
        const notification = new Notification({
          user: post.author._id,
          type: 'like',
          message: `${currentUser.fullName} liked your post`,
          from: currentUser._id
        });
        await notification.save();
      }
      
      res.json({ 
        isLiked: true,
        likes: post.likes.length
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', [
  auth,
  body('content')
    .isLength({ min: 1, max: 200 })
    .withMessage('Comment must be between 1 and 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id).populate('author', 'fullName');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      content: req.body.content
    };

    post.comments.push(newComment);
    await post.save();

    // Create notification for the post author (if not commenting on own post)
    if (post.author._id.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const currentUser = await User.findById(req.user.id);
      
      const notification = new Notification({
        user: post.author._id,
        type: 'comment',
        message: `${currentUser.fullName} commented on your post`,
        from: currentUser._id
      });
      await notification.save();
    }

    // Get the updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username fullName avatar');

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username fullName avatar isVerified')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      currentPage: page,
      hasMore: posts.length === limit
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
