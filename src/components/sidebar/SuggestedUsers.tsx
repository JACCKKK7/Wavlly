import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

export function SuggestedUsers() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestedUsers();
  }, [currentUser]); // Re-load when auth state changes

  const loadSuggestedUsers = async () => {
    try {
      let users;
      
      if (currentUser) {
        // Use authenticated endpoint
        users = await apiService.getSuggestedUsers();
      } else {
        // Use demo endpoint for non-authenticated users
        const response = await fetch('https://wavlly-1.onrender.com/api/users/demo-suggested');
        const data = await response.json();
        users = data.users || [];
      }
      
      setSuggestedUsers(users);
    } catch (error) {
      console.error('Error loading suggested users:', error);
      setSuggestedUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      alert('Please log in to follow users');
      return;
    }

    try {
      const isCurrentlyFollowed = followedUsers.has(userId);
      
      if (isCurrentlyFollowed) {
        const response = await apiService.unfollowUser(userId);
        const newFollowed = new Set(followedUsers);
        newFollowed.delete(userId);
        setFollowedUsers(newFollowed);
        
        // Update the user's follower count in the list
        setSuggestedUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                followers: response.followerCount || Math.max(0, (typeof user.followers === 'number' ? user.followers - 1 : 0)),
                isFollowing: false 
              }
            : user
        ));
      } else {
        const response = await apiService.followUser(userId);
        const newFollowed = new Set(followedUsers);
        newFollowed.add(userId);
        setFollowedUsers(newFollowed);
        
        // Update the user's follower count in the list
        setSuggestedUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                followers: response.followerCount || ((typeof user.followers === 'number' ? user.followers : 0) + 1),
                isFollowing: true 
              }
            : user
        ));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
       <Users size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Suggested for you</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestedUsers.slice(0, 3).map((user) => {
            const isFollowing = followedUsers.has(user.id);
            
            return (
              <div key={user.id} className="flex items-center space-x-3">
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{user.fullName}</h4>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={!currentUser}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !currentUser
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {!currentUser ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Login to Follow</span>
                    </>
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
          {suggestedUsers.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No suggestions available
            </div>
          )}
        </div>
      )}
      
      <button className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
        See all suggestions
      </button>
    </div>
  );
}
