const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Notification = require('./models/Notification');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for notification creation');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestNotifications = async () => {
  try {
    console.log('🔍 Looking for demo users...');
    
    // Get demo users
    const sarah = await User.findOne({ email: 'sarah@example.com' });
    const mike = await User.findOne({ email: 'mike@example.com' });
    const emma = await User.findOne({ email: 'emma@example.com' });
    const alex = await User.findOne({ email: 'alex@example.com' });

    console.log('Found users:', { sarah: !!sarah, mike: !!mike, emma: !!emma, alex: !!alex });

    if (!sarah || !mike || !emma || !alex) {
      console.log('❌ Demo users not found. Please run seed.js first.');
      return;
    }

    // Get some posts
    const posts = await Post.find().limit(3);

    if (posts.length === 0) {
      console.log('❌ No posts found. Please run seed.js first.');
      return;
    }

    // Create notifications for Sarah (she'll receive them)
    const notifications = [
      {
        recipient: sarah._id,
        sender: mike._id,
        type: 'like',
        message: `${mike.fullName} liked your post`,
        relatedPost: posts[0]._id
      },
      {
        recipient: sarah._id,
        sender: emma._id,
        type: 'comment',
        message: `${emma.fullName} commented on your post`,
        relatedPost: posts[0]._id
      },
      {
        recipient: sarah._id,
        sender: alex._id,
        type: 'follow',
        message: `${alex.fullName} started following you`
      },
      {
        recipient: sarah._id,
        sender: emma._id,
        type: 'like',
        message: `${emma.fullName} liked your post`,
        relatedPost: posts[1]._id
      }
    ];

    // Clear existing notifications for Sarah
    await Notification.deleteMany({ recipient: sarah._id });

    // Create new notifications
    for (const notifData of notifications) {
      const notification = new Notification(notifData);
      await notification.save();
      console.log(`✅ Created ${notifData.type} notification for ${sarah.fullName}`);
    }

    console.log('🎉 Test notifications created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await createTestNotifications();
};

run();
