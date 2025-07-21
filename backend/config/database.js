const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add timeout and better error handling
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('🔄 API will continue without database (some features limited)...');
    return false;
  }
};

module.exports = connectDB;
