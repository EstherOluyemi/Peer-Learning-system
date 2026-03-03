// src/components/tutor/TutorLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, Calendar, Star, MessageSquare,
  BookOpen, Bell, Menu, Search, Settings,
  Sun, Moon, Check, X
} from 'lucide-react';
import Navbar from '../Navbar';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api';

const TutorLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('q') || '');
  }, [location.search]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!showNotifications) return;
      setLoadingNotifications(true);
      try {
        const response = await api.get('/v1/tutor/notifications');
        setNotifications(response?.data || response || []);
      } catch (err) {
        console.log('Notifications endpoint not available, using mock data');
        setNotifications([
          { _id: '1', type: 'enrollment', message: 'New student enrolled in Math Session', time: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
          { _id: '2', type: 'message', message: 'New message from Sarah Johnson', time: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
          { _id: '3', type: 'review', message: 'You received a 5-star review', time: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
        ]);
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/v1/tutor/notifications/${notificationId}/read`);
    } catch (err) {
      console.log('Mark as read not available');
    }
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
  };

  const clearAll = async () => {
    try {
      await api.delete('/v1/tutor/notifications');
    } catch (err) {
      console.log('Clear all not available');
    }
    setNotifications([]);
  };

  const formatNotificationTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const params = new URLSearchParams(location.search);
    const trimmed = value.trim();

    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }

    const search = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : ''
      },
      { replace: true }
    );
  };

  const navItems = [
    { label: 'Dashboard', icon: BookOpen, to: '/dashboard-tutor' },
    { label: 'My Sessions', icon: Calendar, to: '/dashboard-tutor/sessions' },
    { label: 'Students', icon: Users, to: '/dashboard-tutor/students' },
    { label: 'Messages', icon: MessageSquare, to: '/dashboard-tutor/messages', badge: totalUnread > 0 ? String(totalUnread > 9 ? '9+' : totalUnread) : undefined },
    { label: 'Reviews', icon: Star, to: '/dashboard-tutor/reviews' },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, to: '/dashboard-tutor/settings' },
    {
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? Sun : Moon,
      to: '#',
      onClick: (e) => { e.preventDefault(); toggleTheme(); }
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Navbar
        navItems={navItems}
        bottomItems={bottomItems}
        user={user}
        onLogout={() => { logout(); navigate('/login'); }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 lg:pl-72 flex flex-col w-full">
        <header
          className="sticky top-0 z-30 backdrop-blur-md h-20 flex items-center justify-between px-4 sm:px-8 border-b transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex relative w-64 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search students, sessions..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  borderColor: 'var(--input-border)'
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" 
                style={{ color: 'var(--text-secondary)' }}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAll}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                            !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                          style={{ borderColor: 'var(--border-color)' }}
                          onClick={() => !notif.read && markAsRead(notif._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {notif.message || notif.title}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                {formatNotificationTime(notif.time || notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/dashboard-tutor/profile')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{user?.name || 'Jane Doe'}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Senior Tutor</div>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name || 'Tutor'}&background=random`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 object-cover"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto" style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TutorLayout;