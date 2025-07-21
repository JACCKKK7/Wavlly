import { useState } from 'react';
import { Search, Bell, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { SearchDropdown } from '../search/SearchDropdown';

export function Header() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleUserSelect = (userId: string) => {
    // Navigate to user profile
    window.location.href = `/profile/${userId}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-2xl font-bold">
              Wavlly
            </div>
            
            <div className="hidden sm:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search users, posts..."
                  onFocus={() => setShowSearch(true)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-all w-64"
                />
              </div>
              <SearchDropdown 
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                onUserSelect={handleUserSelect}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <NotificationDropdown 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
            
            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
              <MessageCircle size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar}
                alt={user?.fullName}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.fullName}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sign out"
            >
             <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}