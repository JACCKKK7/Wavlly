import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Post } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onCommentAdded?: () => void;
}

export function PostCard({ post, onLike, onComment, onCommentAdded }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  const toggleComments = () => {
    setShowComments(!showComments);
    onComment(post.id);
  };

  const handleAuthorClick = () => {
    navigate(`/profile/${post.author.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleAuthorClick}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
          >
            <img
              src={post.author.avatar}
              alt={post.author.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.fullName}</h3>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt))}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all hover:bg-red-50 ${
                post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>

            <button
              onClick={toggleComments}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all hover:bg-blue-50 ${
                showComments ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection 
        postId={post.id} 
        isVisible={showComments} 
        onCommentAdded={onCommentAdded}
      />
    </div>
  );
}