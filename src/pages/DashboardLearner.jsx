// src/pages/DashboardLearner.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen, Clock, TrendingUp, Star, Users, Calendar,
  User, Settings, Plus, Menu, Search, Bell,
  ChevronRight, ArrowUpRight, Sun, Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardLearner = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: BookOpen, to: '/dashboard-learner' },
    { label: 'My Sessions', icon: Calendar, to: '/sessions' },
    { label: 'Create Session', icon: Plus, to: '/create-session' },
    { label: 'Profile', icon: User, to: '/profile' },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, to: '/settings' },
    {
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? Sun : Moon,
      to: '#',
      onClick: (e) => { e.preventDefault(); toggleTheme(); }
    },
  ];

  const statCards = [
    { icon: BookOpen, label: 'Total Sessions', value: 12, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Clock, label: 'Upcoming', value: 3, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: TrendingUp, label: 'Completed', value: 9, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Star, label: 'Avg Rating', value: '4.9', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  const upcomingSessions = [
    { id: 1, title: 'Intro to React Hooks', subject: 'Computer Science', date: 'Today, 14:00', participants: '8/15', tutor: 'Jane Doe' },
    { id: 2, title: 'Calculus: Derivatives', subject: 'Mathematics', date: 'Tomorrow, 16:30', participants: '12/12', tutor: 'Dr. Smith' },
    { id: 3, title: 'Organic Chemistry Lab', subject: 'Chemistry', date: 'Dec 22, 10:00', participants: '6/8', tutor: 'Alex T.' },
  ];

  const recentActivity = [
    { id: 1, type: 'New session available', detail: 'Advanced React Patterns', time: '2h ago', icon: Plus },
    { id: 2, type: 'Session completed', detail: 'JavaScript Fundamentals', time: 'Yesterday', icon: BookOpen },
    { id: 3, type: 'System', detail: 'Welcome to PeerLearn!', time: '2d ago', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
          className="sticky top-0 z-30 backdrop-blur-md h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 border-b transition-all duration-300"
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
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block w-64 md:w-80">
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
          <div className="flex items-center gap-4">
            <button
              className="relative p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Student'}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Learner</span>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
              alt="Profile"
              className="w-9 h-9 rounded-full border"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
                  Ready to continue your learning journey?
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Browse Sessions
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div key={i} className="rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md" 
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming Sessions</h2>
                    <Link to="/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                      View Schedule <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {upcomingSessions.map((session, i) => (
                      <div key={i} className="p-6 transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{session.title}</h3>
                              <div className="text-sm mt-1 flex flex-wrap items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {session.tutor}</span>
                                <span className="hidden sm:inline w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                <span>{session.subject}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{session.date}</div>
                              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.participants} joined</div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <ArrowUpRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl shadow-sm border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20">
                      <Search className="w-5 h-5" /> Find a Tutor
                    </button>
                    <button className="w-full border text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:transition-all"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <User className="w-5 h-5" /> Edit Profile
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl shadow-sm border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1 p-1.5 rounded-full h-fit" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.type}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.detail}</p>
                          <p className="text-[10px] mt-1 uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLearner;
