// src/components/tutor/TutorLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, Calendar, Star, MessageSquare,
  BookOpen, Bell, Menu, Search, Settings,
  Sun, Moon
} from 'lucide-react';
import Navbar from '../Navbar';

const TutorLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('q') || '');
  }, [location.search]);

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
    { label: 'Messages', icon: MessageSquare, to: '/dashboard-tutor/messages', badge: '3' },
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
            <button className="relative p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3">
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

export default TutorLayout;