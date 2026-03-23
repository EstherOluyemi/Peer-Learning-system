// src/components/learner/LearnerLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    BookOpen, Clock, TrendingUp, Star, Users, Calendar,
    User, Settings, Plus, Menu, Search, Bell, MessageSquare,
    ChevronRight, ArrowUpRight, Sun, Moon, FileText, Check, X,
    CheckCircle, AlertCircle, Info
} from 'lucide-react';
import Navbar from '../Navbar';
import { useChat } from '../../context/ChatContext';
import SkipToContent from '../common/SkipToContext';
import socketService from '../../services/socketService';
import {
    clearAllNotifications,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    normalizeNotificationFromSocket,
} from '../../services/notificationService';

const LearnerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { totalUnread } = useChat();

    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loadingNotifications, setLoadingNotifications] = React.useState(false);
    const [notificationsError, setNotificationsError] = React.useState(null);
    const notificationRef = React.useRef(null);
    const mainContentRef = React.useRef(null);

    const navItems = [
        { label: 'Dashboard', icon: BookOpen, to: '/dashboard-learner' },
        { label: 'My Sessions', icon: Calendar, to: '/dashboard-learner/sessions' },
        { label: 'Materials', icon: FileText, to: '/dashboard-learner/materials' },
        { label: 'Browse Sessions', icon: Search, to: '/dashboard-learner/browse-sessions' },
        { label: 'Messages', icon: MessageSquare, to: '/dashboard-learner/messages', badge: totalUnread > 0 ? String(totalUnread > 9 ? '9+' : totalUnread) : undefined },
        { label: 'Reviews', icon: Star, to: '/dashboard-learner/reviews' },
        { label: 'Profile', icon: User, to: '/dashboard-learner/profile' },
    ];

    const bottomItems = [
        { label: 'Settings', icon: Settings, to: '/dashboard-learner/settings' },
        {
            label: darkMode ? 'Light Mode' : 'Dark Mode',
            icon: darkMode ? Sun : Moon,
            to: '#',
            onClick: (e) => { e.preventDefault(); toggleTheme(); }
        },
    ];

    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (!showNotifications) return;
            setLoadingNotifications(true);
            setNotificationsError(null);
            try {
                const { notifications: items } = await getNotifications({ page: 1, limit: 20 });
                setNotifications(items);
                setUnreadCount(items.filter((item) => !item.read).length);
            } catch (err) {
                console.error('Failed to load notifications:', {
                    status: err?.status,
                    code: err?.code,
                    message: err?.message,
                    payload: err?.payload,
                });
                setNotifications([]);
                setNotificationsError(err?.message || 'Could not load notifications.');
            } finally {
                setLoadingNotifications(false);
            }
        };
        fetchNotifications();
    }, [showNotifications]);

    React.useEffect(() => {
        let mounted = true;

        const loadUnreadCount = async () => {
            try {
                const count = await getUnreadNotificationCount();
                if (mounted) setUnreadCount(count);
            } catch {
                if (mounted) {
                    setUnreadCount((prev) => prev);
                }
            }
        };

        loadUnreadCount();
        return () => { mounted = false; };
    }, []);

    React.useEffect(() => {
        const offNew = socketService.on('notification:new', (payload) => {
            const notification = normalizeNotificationFromSocket(payload);
            if (!notification?._id) return;

            setNotifications((prev) => {
                if (prev.some((item) => item._id === notification._id)) return prev;
                return [notification, ...prev];
            });

            if (!notification.read) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        const offRead = socketService.on('notification:read', (payload) => {
            const notificationId = payload?.notificationId || payload?._id || payload?.id;
            if (!notificationId) return;

            setNotifications((prev) =>
                prev.map((item) => (item._id === notificationId ? { ...item, read: true } : item))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        });

        const offAllRead = socketService.on('notification:all-read', () => {
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            setUnreadCount(0);
        });

        const offUnread = socketService.on('notification:unread-count', (payload) => {
            const count = typeof payload?.count === 'number'
                ? payload.count
                : typeof payload?.unreadCount === 'number'
                    ? payload.unreadCount
                    : null;

            if (count !== null) {
                setUnreadCount(count);
            }
        });

        return () => {
            offNew();
            offRead();
            offAllRead();
            offUnread();
        };
    }, []);

    React.useEffect(() => {
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

    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowNotifications(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    React.useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.focus();
        }
    }, [location.pathname]);

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
        } catch (err) {
            console.log('Mark as read not available');
        }
        setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const clearAll = async () => {
        try {
            await clearAllNotifications();
        } catch (err) {
            console.log('Clear all not available');
        }
        setNotifications([]);
        setUnreadCount(0);
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

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'INFO':
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <SkipToContent />
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
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-6 h-6" aria-hidden="true" />
                        </button>
                        <div className="hidden sm:flex relative w-64 md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Find sessions or tutors..."
                                aria-label="Search sessions or tutors"
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
                                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                                aria-expanded={showNotifications}
                                aria-controls="learner-notifications-panel"
                            >
                                <Bell className="w-6 h-6" aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div
                                    id="learner-notifications-panel"
                                    role="dialog"
                                    aria-label="Notifications panel"
                                    aria-live="polite"
                                    aria-atomic="false"
                                    className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-xl shadow-2xl border overflow-hidden z-50"
                                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setShowNotifications(false);
                                        }
                                    }}
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
                                        ) : notificationsError ? (
                                            <div className="p-6 text-center">
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{notificationsError}</p>
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Close
                                                </button>
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
                                                        <div className="shrink-0 mt-0.5">
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                {notif.message || notif.title}
                                                            </p>
                                                            {notif.data?.sessionTitle && (
                                                                <p className="text-xs mt-1 text-blue-600 font-medium">
                                                                    {notif.data.sessionTitle}
                                                                </p>
                                                            )}
                                                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                                                {formatNotificationTime(notif.time || notif.createdAt)}
                                                            </p>
                                                        </div>
                                                        {!notif.read && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded shrink-0"
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
                            onClick={() => navigate('/dashboard-learner/profile')}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                            aria-label="Open profile"
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Student'}</div>
                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Learner</div>
                            </div>
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 object-cover"
                                style={{ borderColor: 'var(--border-color)' }}
                            />
                        </button>
                    </div>
                </header>

                <main id="main-content" ref={mainContentRef} tabIndex={-1} className="flex-1 p-4 sm:p-8 overflow-y-auto" style={{
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

export default LearnerLayout;
