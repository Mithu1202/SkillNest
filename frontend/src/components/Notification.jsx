import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../api/websocket';
import { useNavigate } from 'react-router-dom';

const Notification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications and setup WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const userId = user.id;
    fetchNotifications(userId);

    // Connect to WebSocket
    connectWebSocket(userId, (notification) => {
      // Prevent duplicate notifications
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => (notification.isRead ? prev : prev + 1));
      toast.info(notification.message, {
        onClick: () => navigate(`/post/${notification.postId}`),
      });
    });

    // Cleanup WebSocket on unmount
    return () => disconnectWebSocket();
  }, [user?.id, navigate]);

  const fetchNotifications = async (userId) => {
    setIsLoading(true);
    try {
      const { data } = await API.get(`/auth/notifications/unread?userId=${userId}`);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } else {
        throw new Error('Invalid notifications data format');
      }
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error('Fetch notifications error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.post(`/auth/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark notification as read');
      console.error('Mark as read error:', err.message);
      // Revert optimistic update if needed
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600"
        aria-label="Notifications"
        aria-expanded={showNotifications}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-gray-500">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-100 cursor-pointer transition-colors`}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  
                  setShowNotifications(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!notification.isRead) markAsRead(notification.id);
                    
                    setShowNotifications(false);
                  }
                }}
              >
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;