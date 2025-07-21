import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatDistanceToNow } from '../../utils/dateUtils';
import type { Notification } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('wavvly_token');
      
      if (!token) {
        // If not authenticated, show demo notifications or empty state
        setNotifications([]);
        return;
      }
      
      const data = await apiService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-purple-50' : ''
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={notification.from.avatar}
                    alt={notification.from.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-1">
                      <span className="font-medium">{notification.from.fullName}</span>{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt))}
                    </p>
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
