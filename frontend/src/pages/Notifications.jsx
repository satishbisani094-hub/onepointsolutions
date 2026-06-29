import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiBell, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import Toast from '../components/Toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Unread, Read

  const [toast, setToast] = useState({ message: null, type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      showToast('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      showToast('Notification deleted');
      fetchNotifications();
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.is_read;
    if (filter === 'Read') return n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <FiBell className="mr-3 text-primary-500" />
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review alerts, updates, and schedule conflicts.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="All">All</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>
          <button 
            onClick={handleMarkAllAsRead}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-primary-600 dark:text-primary-400 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total alerts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">{notifications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unread</p>
          <p className="mt-2 text-2xl font-semibold text-primary-600">{notifications.filter((notification) => !notification.is_read).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Read</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{notifications.filter((notification) => notification.is_read).length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1">
        <div className="h-full overflow-y-auto p-2">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center text-slate-400">
              <FiBell className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600 opacity-50" />
              <p>No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`flex items-start justify-between p-4 rounded-xl transition-colors ${
                    !notification.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full mt-0.5 flex-shrink-0 ${
                      !notification.is_read ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      <FiBell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center text-xs text-slate-400 mt-1.5 font-medium">
                        <FiClock className="mr-1.5" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Mark as Read"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Notification"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: null, type: 'success' })} 
      />
    </div>
  );
};

export default Notifications;
