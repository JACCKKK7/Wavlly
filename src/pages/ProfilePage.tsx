import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Link as LinkIcon, MoreHorizontal, Settings } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PostCard } from '../components/feed/PostCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Post, User } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Determine if this is "my profile" based on the pathname
  const isMyProfile = location.pathname === '/profile/me';
  
  // Determine the actual user ID to load
  const targetUserId = isMyProfile ? currentUser?.id : userId;
  const isOwnProfile = currentUser?.id === targetUserId;

  // Debug logging
  console.log('ProfilePage - userId:', userId, 'pathname:', location.pathname, 'currentUser:', currentUser?.id, 'targetUserId:', targetUserId, 'isMyProfile:', isMyProfile);

  useEffect(() => {
    // Wait for auth context to initialize
    if (isMyProfile && !currentUser) {
      // Auth is still loading or user is not logged in
      setLoading(false);
      setPostsLoading(false);
      return;
    }

    // Only load profile if we have a valid targetUserId
    if (targetUserId && targetUserId !== 'undefined' && targetUserId.trim() !== '') {
      loadUserProfile();
      loadUserPosts();
    } else {
      console.error('Invalid targetUserId:', targetUserId);
      setLoading(false);
      setPostsLoading(false);
    }
  }, [targetUserId, currentUser, isMyProfile]);

  const loadUserProfile = async () => {
    if (!targetUserId || targetUserId === 'undefined' || targetUserId.trim() === '') {
      console.error('No valid user ID to load profile for:', targetUserId);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await apiService.getUserProfile(targetUserId);
      setUser(userData.user);
      
      // Check if current user is following this user
      if (currentUser && userData.user.followers && !isOwnProfile) {
        const isCurrentlyFollowing = Array.isArray(userData.user.followers) 
          ? userData.user.followers.some((follower: any) => 
              (follower.id || follower._id) === currentUser.id
            )
          : false;
        setIsFollowing(isCurrentlyFollowing);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!targetUserId || targetUserId === 'undefined' || targetUserId.trim() === '') {
      console.error('No valid user ID to load posts for:', targetUserId);
      setPostsLoading(false);
      return;
    }

    try {
      setPostsLoading(true);
      const data = await apiService.getUserPosts(targetUserId);
      
      // The backend already transforms the posts, so use them directly
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading user posts:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Please log in to follow users');
      return;
    }

    if (!targetUserId || targetUserId === 'undefined' || targetUserId.trim() === '') {
      console.error('No valid user ID to follow:', targetUserId);
      return;
    }

    try {
      if (isFollowing) {
        const response = await apiService.unfollowUser(targetUserId);
        setIsFollowing(false);
        setUser(prev => prev ? { 
          ...prev, 
          followerCount: response.followerCount || Math.max(0, (prev.followerCount || 0) - 1)
        } : null);
      } else {
        const response = await apiService.followUser(targetUserId);
        setIsFollowing(true);
        setUser(prev => prev ? { 
          ...prev, 
          followerCount: response.followerCount || (prev.followerCount || 0) + 1
        } : null);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const data = await apiService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: data.isLiked,
              likes: data.likes
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Opening comments for post:', postId);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!targetUserId || targetUserId === 'undefined' || targetUserId.trim() === '') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isMyProfile ? 'Please Log In' : 'Invalid Profile'}
          </h2>
          <p className="text-gray-600">
            {isMyProfile 
              ? 'You need to be logged in to view your profile.' 
              : 'Please check the URL or try again.'
            }
          </p>
          {isMyProfile && (
            <button
              onClick={() => window.location.href = '/auth'}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              {/* Profile Picture */}
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`px-6 py-2 rounded-full font-medium transition-colors ${
                            isFollowing
                              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {user.bio && (
                  <p className="text-gray-800 mt-3">{user.bio}</p>
                )}
                
                <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon size={14} />
                    <span>website.com</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Joined {user.joinDate ? formatDistanceToNow(new Date(user.joinDate)) : formatDistanceToNow(new Date(user.createdAt || Date.now()))}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-3">
                  <div>
                    <span className="font-bold text-gray-900">{user.followingCount || 0}</span>
                    <span className="text-gray-600 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{user.followerCount || 0}</span>
                    <span className="text-gray-600 ml-1">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(['posts', 'replies', 'media'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                {isOwnProfile ? "You haven't posted anything yet." : `${user.fullName} hasn't posted anything yet.`}
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}