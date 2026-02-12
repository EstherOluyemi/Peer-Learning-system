// src/pages/DashboardTutor.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Star, TrendingUp, MessageSquare,
  BookOpen, DollarSign, Bell, Menu, Search, Settings,
  ChevronRight, Clock, Sun, Moon, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';

const DashboardTutor = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', icon: BookOpen, to: '/dashboard-tutor' },
    { label: 'My Sessions', icon: Calendar, to: '/sessions' },
    { label: 'Students', icon: Users, to: '/students' },
    { label: 'Messages', icon: MessageSquare, to: '/messages', badge: '3' },
    { label: 'Reviews', icon: Star, to: '/reviews' },
    { label: 'Earnings', icon: DollarSign, to: '/earnings' },
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

  const upcomingSessions = [
    { id: 1, title: "React Fundamentals", learners: 12, time: "2:00 PM", date: "Today", status: "confirmed", type: "Workshop" },
    { id: 2, title: "Advanced JavaScript", learners: 8, time: "4:30 PM", date: "Tomorrow", status: "pending", type: "1-on-1" },
    { id: 3, title: "UI/UX Workshop", learners: 15, time: "11:00 AM", date: "Dec 24", status: "confirmed", type: "Webinar" },
  ];

  const performanceStats = [
    { label: "Total Students", value: "47", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", trend: "up" },
    { label: "Rating", value: "4.8", change: "+0.2", icon: Star, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", trend: "up" },
    { label: "Hours Taught", value: "156h", change: "+18%", icon: Clock, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", trend: "up" },
    { label: "Earnings", value: "$2,840", change: "+22%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", trend: "up" },
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
            backgroundColor: 'rgba(var(--bg-primary-rgb), 0.8)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex relative w-64 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search students, sessions..."
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
              className="relative p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2" style={{ ringColor: 'var(--bg-primary)' }}></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Jane Doe'}</div>
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
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Tutor Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Manage your sessions and track your student's progress.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Create New Session
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceStats.map((stat, index) => (
                <div key={index} className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming Sessions</h2>
                    <Link to="/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="p-6 transition-colors group" style={{ backgroundColor: 'var(--card-bg)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                              <span className="text-xs font-bold uppercase">{session.date.split(' ')[0]}</span>
                              <span className="text-lg font-bold">{session.time.split(':')[0]}</span>
                            </div>
                            <div>
                              <h4 className="font-bold group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{session.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {session.learners} students</span>
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                <span>{session.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            {session.status === 'confirmed' ? (
                              <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800">Confirmed</span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800">Pending</span>
                            )}
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

              <div className="space-y-8">
                <div className="rounded-2xl shadow-sm border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={MessageSquare} label="Message" color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <ActionButton icon={BookOpen} label="Materials" color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />
                    <ActionButton icon={Calendar} label="Schedule" color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
                    <ActionButton icon={Settings} label="Settings" color="bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300" />
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

const ActionButton = ({ icon: Icon, label, color }) => (
  <button className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}>
    <Icon className="w-6 h-6 mb-2" />
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default DashboardTutor;
