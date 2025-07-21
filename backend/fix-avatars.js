const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for avatar fix');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixAvatars = async () => {
  try {
    await connectDB();
    
    // Find all users with empty or missing avatars
    const usersWithoutAvatars = await User.find({
      $or: [
        { avatar: '' },
        { avatar: { $exists: false } },
        { avatar: null }
      ]
    });

    console.log(`Found ${usersWithoutAvatars.length} users without proper avatars`);

    // Update each user with a generated avatar
    for (const user of usersWithoutAvatars) {
      const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=8b5cf6&color=fff&size=128`;
      
      await User.findByIdAndUpdate(user._id, {
        avatar: generatedAvatar
      });
      
      console.log(`✅ Updated avatar for ${user.fullName} (${user.username})`);
    }

    console.log('🎉 Avatar fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing avatars:', error);
    process.exit(1);
  }
};

fixAvatars();
