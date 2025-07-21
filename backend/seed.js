const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data (optional)
    // await User.deleteMany({});
    // await Post.deleteMany({});

    // Create demo users
    const users = [
      {
        username: 'sarah_chen',
        email: 'sarah@example.com',
        fullName: 'Sarah Chen',
        password: await bcrypt.hash('password', 12),
        bio: 'UI/UX Designer passionate about creating beautiful experiences',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      },
      {
        username: 'mike_dev',
        email: 'mike@example.com',
        fullName: 'Mike Johnson',
        password: await bcrypt.hash('password', 12),
        bio: 'Full-stack developer building the future',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      },
      {
        username: 'emma_photo',
        email: 'emma@example.com',
        fullName: 'Emma Williams',
        password: await bcrypt.hash('password', 12),
        bio: 'Photographer capturing life\'s beautiful moments',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      },
      {
        username: 'alex_startup',
        email: 'alex@example.com',
        fullName: 'Alex Rodriguez',
        password: await bcrypt.hash('password', 12),
        bio: 'Entrepreneur building the next big thing',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.fullName}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`⚪ User already exists: ${existingUser.fullName}`);
      }
    }

    // Create demo posts
    const posts = [
      {
        author: createdUsers[0]._id,
        content: 'Just finished a new design system for our mobile app! The color palette is inspired by nature 🌿✨ #design #ux',
        images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop']
      },
      {
        author: createdUsers[1]._id,
        content: 'Deployed my first full-stack app today! Built with React, Node.js, and MongoDB. Feeling accomplished 🚀 #coding #webdev',
        images: []
      },
      {
        author: createdUsers[2]._id,
        content: 'Golden hour photography session in the city. Sometimes the best shots are unplanned! 📸🌅',
        images: ['https://images.pexels.com/photos/1462935/pexels-photo-1462935.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop']
      },
      {
        author: createdUsers[3]._id,
        content: 'Building a startup is like riding a rollercoaster... thrilling and terrifying at the same time! Anyone else feeling this? 🎢',
        images: []
      },
      {
        author: createdUsers[0]._id,
        content: 'Working on some logo concepts today. Love the creative process! 🎨',
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop']
      }
    ];

    for (const postData of posts) {
      const existingPost = await Post.findOne({ 
        author: postData.author, 
        content: postData.content 
      });
      
      if (!existingPost) {
        const post = new Post(postData);
        await post.save();
        console.log(`✅ Created post by ${createdUsers.find(u => u._id.equals(postData.author))?.fullName}`);
      } else {
        console.log(`⚪ Post already exists`);
      }
    }

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();
