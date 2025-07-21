import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  isVisible: boolean;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, isVisible, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible && comments.length === 0) {
      loadComments();
    }
  }, [isVisible, postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPost(postId);
      
      // Transform comments to match our interface
      const transformedComments = (data.post.comments || []).map((comment: any) => ({
        _id: comment._id,
        content: comment.content,
        author: {
          _id: comment.user._id,
          username: comment.user.username,
          fullName: comment.user.fullName,
          avatar: comment.user.avatar
        },
        likes: 0, // Comments don't have likes yet in backend
        isLiked: false,
        createdAt: comment.createdAt
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const result = await apiService.commentOnPost(postId, newComment);
      
      // Add the new comment to the list
      const newCommentObj = {
        _id: result.comment._id,
        content: result.comment.content,
        author: {
          _id: result.comment.user._id,
          username: result.comment.user.username,
          fullName: result.comment.user.fullName,
          avatar: result.comment.user.avatar
        },
        likes: 0,
        isLiked: false,
        createdAt: result.comment.createdAt
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
      // Call the callback to refresh parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      // const data = await apiService.likeComment(commentId);
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : comment
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div className="space-y-3">
        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="flex space-x-3">
          <img
            src={user?.avatar}
            alt={user?.fullName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="p-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>
        
        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <button 
                  onClick={() => navigate(`/profile/${comment.author._id}`)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>
                <div className="flex-1">
                  <div className="bg-white rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <button 
                        onClick={() => navigate(`/profile/${comment.author._id}`)}
                        className="text-sm font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {comment.author.fullName}
                      </button>
                      <span className="text-xs text-gray-500">
                        @{comment.author.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4 mt-1 pl-3">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center space-x-1 text-xs hover:text-red-500 transition-colors ${
                        comment.isLiked ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                    
                    <button className="text-xs text-gray-500 hover:text-purple-500 transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
