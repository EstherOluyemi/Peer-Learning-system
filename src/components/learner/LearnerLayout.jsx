// src/components/learner/LearnerLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, Clock, TrendingUp, Star, Users, Calendar,
    User, Settings, Plus, Menu, Search, Bell,
    ChevronRight, ArrowUpRight, Sun, Moon
} from 'lucide-react';
import Navbar from '../Navbar';

const LearnerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navItems = [
        { label: 'Dashboard', icon: BookOpen, to: '/dashboard-learner' },
        { label: 'My Sessions', icon: Calendar, to: '/dashboard-learner/sessions' },
        { label: 'Create Session', icon: Plus, to: '/dashboard-learner/create-session' },
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
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:flex relative w-64 md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Find sessions or tutors..."
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
                        <button
                            className="relative p-2 rounded-full transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                        </button>
                        <div className="flex items-center gap-3">
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
                        </div>
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

export default LearnerLayout;