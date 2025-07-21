const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Mock upload function for demo purposes when Cloudinary is not configured
const mockUpload = (buffer, options) => {
  return new Promise((resolve) => {
    // Generate a mock URL based on the file content
    const timestamp = Date.now();
    const mockUrl = `https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=300&t=${timestamp}`;
    
    setTimeout(() => {
      resolve({
        secure_url: mockUrl,
        public_id: `mock_${timestamp}`,
        format: 'png'
      });
    }, 1000); // Simulate upload delay
  });
};

// Override uploader for demo
const originalUploadStream = cloudinary.uploader.upload_stream;
cloudinary.uploader.upload_stream = function(options, callback) {
  // If no real credentials, use mock
  if (process.env.CLOUDINARY_CLOUD_NAME === 'demo' || !process.env.CLOUDINARY_CLOUD_NAME) {
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    
    bufferStream.on('finish', async () => {
      try {
        const result = await mockUpload(null, options);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    });
    
    return bufferStream;
  }
  
  // Use real Cloudinary if credentials are provided
  return originalUploadStream.call(this, options, callback);
};

module.exports = cloudinary;
