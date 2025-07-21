import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { SearchDropdown } from '../search/SearchDropdown';
import { apiService } from '../../services/api';
import type { Notification } from '../../types';

export function Header() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!user || !localStorage.getItem('wavvly_token')) return;
    
    try {
      const data = await apiService.getNotifications();
      const notifications = data.notifications || [];
      const unread = notifications.filter((notification: Notification) => !notification.read);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Reset count on error
      setUnreadCount(0);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (user && localStorage.getItem('wavvly_token')) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0); // Reset count when not authenticated
    }
  }, [user]);

  const handleNotificationOpen = () => {
    setShowNotifications(!showNotifications);
    // Reset unread count when opening notifications
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  const handleDemoLogin = async () => {
    try {
      // Try to login with demo credentials (using Sarah's account from seed data)
      const success = await login('sarah@example.com', 'password');
      if (!success) {
        alert('Demo login failed. Please try again.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Demo login failed. Please try again.');
    }
  };

  const handleUserSelect = (userId: string) => {
    // Navigate to user profile
    navigate(`/profile/${userId}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-2xl font-bold">
              Wavvly
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
            {user ? (
              <>
                <div className="relative">
                  <button 
                    onClick={handleNotificationOpen}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    )}
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
                  <button 
                    onClick={() => navigate('/profile/me')}
                    className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.fullName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.fullName}
                    </span>
                  </button>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign out"
                >
                 <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDemoLogin}
                  className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Demo Login
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}