import React from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  // Provide a default avatar if none exists or if it's empty
  const avatarUrl = user.avatar && user.avatar.trim() !== '' 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=8b5cf6&color=fff&size=80`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <img
          src={avatarUrl}
          alt={user.fullName}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-purple-100"
          onError={(e) => {
            // Fallback to generated avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=8b5cf6&color=fff&size=80`;
          }}
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-1">{user.fullName}</h2>
        <p className="text-gray-600 mb-3">@{user.username}</p>
        
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{user.bio}</p>
        
        <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
          <Calendar size={16} />
          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-around pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.following}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.followers}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
}