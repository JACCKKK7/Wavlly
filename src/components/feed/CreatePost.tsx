import { useState, useRef } from 'react';
import { Image, Smile, MapPin, X, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

interface CreatePostProps {
  onPostCreate: (content: string, image?: string) => void;
}

export function CreatePost({ onPostCreate }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onPostCreate(content, selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
      setIsExpanded(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const result = await apiService.uploadFile(file, 'post');
      setSelectedImage(result.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const sampleImages = [
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1462935/pexels-photo-1462935.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-3">
        <img
          src={user?.avatar}
          alt={user?.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's on your mind?"
              className="w-full resize-none border-none outline-none text-gray-800 placeholder-gray-500 text-lg"
              rows={isExpanded ? 3 : 1}
            />

            {selectedImage && (
              <div className="relative mt-3">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full rounded-lg object-cover max-h-64"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {!selectedImage && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Add an image:</p>
                    
                    {/* File Upload Button */}
                    <div className="mb-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        <span className="text-sm">
                          {isUploading ? 'Uploading...' : 'Upload from device'}
                        </span>
                      </button>
                    </div>

                    {/* Sample Images */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Or choose from samples:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {sampleImages.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className="aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={image}
                              alt={`Option ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                     <Image className="w-5 h-5" />
                      <span className="text-sm">Photo</span>
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                     <Smile className="w-5 h-5" />
                      <span className="text-sm">Feeling</span>
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">Location</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!content.trim() || isUploading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isUploading ? 'Uploading...' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}