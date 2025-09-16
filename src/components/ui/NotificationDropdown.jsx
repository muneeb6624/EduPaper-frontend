import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Bell,
  CheckCircle,
  Clock,
  FileText,
  User,
  Award,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation, 
  useDeleteNotificationMutation 
} from '../../features/notifications/notificationApi';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  // API hooks
  const { data: notificationData, isLoading } = useGetNotificationsQuery(
    { limit: 10 },
    { skip: !user?._id }
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Get notifications from API or use mock data
  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  // Add icon and color mapping for notifications
  const getNotificationStyle = (type) => {
    const styles = {
      exam_assigned: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
      result_published: { icon: Award, color: 'text-green-400', bgColor: 'bg-green-600/20' },
      exam_reminder: { icon: Clock, color: 'text-orange-400', bgColor: 'bg-orange-600/20' },
      submission_received: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
      grading_pending: { icon: Clock, color: 'text-orange-400', bgColor: 'bg-orange-600/20' },
      student_registered: { icon: User, color: 'text-purple-400', bgColor: 'bg-purple-600/20' },
    };
    return styles[type] || { icon: Bell, color: 'text-gray-400', bgColor: 'bg-gray-600/20' };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id).unwrap();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTimeAgo = (timeString) => {
    // Simple time ago function
    return timeString;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-80 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Mark all read
                  </motion.button>
                )}
                <span className="text-xs text-gray-400">
                  {unreadCount} unread
                </span>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="p-2">
                  {notifications.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    const IconComponent = style.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        className={`p-3 rounded-lg mb-2 transition-all duration-200 cursor-pointer group ${
                          notification.read 
                            ? 'bg-gray-700/30 hover:bg-gray-700/50' 
                            : 'bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20'
                        }`}
                        onClick={() => handleMarkAsRead(notification._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${style.bgColor}`}>
                            <IconComponent className={`w-4 h-4 ${style.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  notification.read ? 'text-gray-300' : 'text-white'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-3 h-3 text-gray-400" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700">
                <motion.button
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  View All Notifications
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;