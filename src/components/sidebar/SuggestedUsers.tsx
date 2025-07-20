import React, { useState } from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

export function SuggestedUsers() {
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const handleFollow = (userId: string) => {
    const newFollowed = new Set(followedUsers);
    if (newFollowed.has(userId)) {
      newFollowed.delete(userId);
    } else {
      newFollowed.add(userId);
    }
    setFollowedUsers(newFollowed);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
       <Users size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Suggested for you</h3>
      </div>
      
      <div className="space-y-4">
        {mockUsers.slice(0, 3).map((user) => {
          const isFollowing = followedUsers.has(user.id);
          
          return (
            <div key={user.id} className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{user.fullName}</h4>
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              </div>
              
              <button
                onClick={() => handleFollow(user.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isFollowing ? (
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
      </div>
      
      <button className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
        See all suggestions
      </button>
    </div>
  );
}