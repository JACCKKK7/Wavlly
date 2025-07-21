const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Notification = require('./models/Notification');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for creating test notifications');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestNotifications = async () => {
  try {
    // Get users
    const sarah = await User.findOne({ email: 'sarah@example.com' });
    const mike = await User.findOne({ email: 'mike@example.com' });
    const emma = await User.findOne({ email: 'emma@example.com' });
    const alex = await User.findOne({ email: 'alex@example.com' });

    if (!sarah || !mike || !emma || !alex) {
      console.log('❌ Users not found. Please run seed.js first.');
      process.exit(1);
    }

    // Get a post by Sarah
    const sarahPost = await Post.findOne({ author: sarah._id });

    // Create test notifications for Sarah
    const notifications = [
      {
        recipient: sarah._id,
        sender: mike._id,
        type: 'follow',
        message: 'started following you',
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        recipient: sarah._id,
        sender: emma._id,
        type: 'follow',
        message: 'started following you',
        createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      }
    ];

    // Add like notification if post exists
    if (sarahPost) {
      notifications.push({
        recipient: sarah._id,
        sender: alex._id,
        type: 'like',
        message: 'liked your post',
        relatedPost: sarahPost._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      });

      notifications.push({
        recipient: sarah._id,
        sender: mike._id,
        type: 'comment',
        message: 'commented on your post',
        relatedPost: sarahPost._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      });
    }

    // Create notifications
    for (const notifData of notifications) {
      const existingNotif = await Notification.findOne({
        recipient: notifData.recipient,
        sender: notifData.sender,
        type: notifData.type,
        message: notifData.message
      });

      if (!existingNotif) {
        const notification = new Notification(notifData);
        await notification.save();
        console.log(`✅ Created ${notifData.type} notification for Sarah from ${notifData.sender}`);
      } else {
        console.log(`⚪ Notification already exists: ${notifData.type}`);
      }
    }

    console.log('🎉 Test notifications created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await createTestNotifications();
};

run();
