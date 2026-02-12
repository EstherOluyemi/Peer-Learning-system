import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Star, TrendingUp, MessageSquare,
  BookOpen, DollarSign, Bell, LogOut, Menu, X,
  Search, Settings, ChevronRight, Clock
} from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';

const DashboardTutor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Toggle Dark Mode
  const handleThemeToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  // Mock Data
  const upcomingSessions = [
    { id: 1, title: "React Fundamentals", learners: 12, time: "2:00 PM", date: "Today", status: "confirmed", type: "Workshop" },
    { id: 2, title: "Advanced JavaScript", learners: 8, time: "4:30 PM", date: "Tomorrow", status: "pending", type: "1-on-1" },
    { id: 3, title: "UI/UX Workshop", learners: 15, time: "11:00 AM", date: "Dec 24", status: "confirmed", type: "Webinar" },
  ];

  const performanceStats = [
    { label: "Total Students", value: "47", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-100", trend: "up" },
    { label: "Rating", value: "4.8", change: "+0.2", icon: Star, color: "text-amber-600", bg: "bg-amber-100", trend: "up" },
    { label: "Hours Taught", value: "156h", change: "+18%", icon: Clock, color: "text-purple-600", bg: "bg-purple-100", trend: "up" },
    { label: "Earnings", value: "$2,840", change: "+22%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100", trend: "up" },
  ];

  const reviews = [
    { name: "Alex Chen", comment: "Great explanation of React hooks!", rating: 5, date: "2h ago" },
    { name: "Maria Garcia", comment: "Very patient and helpful.", rating: 5, date: "1d ago" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-700">
            <img src={peerlearnLogo} alt="PeerLearn" className="h-8 w-8 mr-3" />
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">PeerLearn</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-500 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavItem icon={BookOpen} label="Dashboard" active />
            <NavItem icon={Calendar} label="My Sessions" />
            <NavItem icon={Users} label="Students" />
            <NavItem icon={MessageSquare} label="Messages" badge="3" />
            <NavItem icon={Star} label="Reviews" />
            <NavItem icon={DollarSign} label="Earnings" />
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Dark Mode</span>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="lg:pl-72 flex flex-col min-h-screen">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar (Hidden on small mobile) */}
            <div className="hidden sm:flex relative w-64 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{user?.name || 'Jane Doe'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Senior Tutor</div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Settings</Link>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your teaching activities and upcoming schedule.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                New Session
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceStats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
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
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid (Left: Sessions, Right: Actions/Reviews) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column (Span 2) */}
              <div className="lg:col-span-2 space-y-8">

                {/* Upcoming Sessions Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>
                    <Link to="/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                              <span className="text-xs font-bold uppercase">{session.date.split(' ')[0]}</span>
                              <span className="text-lg font-bold">{session.time.split(':')[0]}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{session.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {session.learners} students</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>{session.type}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pl-18 sm:pl-0">
                            {session.status === 'confirmed' ? (
                              <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800">Confirmed</span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800">Pending</span>
                            )}
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              <Settings className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Span 1) */}
              <div className="space-y-8">

                {/* Quick Actions Grid */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={MessageSquare} label="Message" color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <ActionButton icon={BookOpen} label="Materials" color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />
                    <ActionButton icon={Calendar} label="Schedule" color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
                    <ActionButton icon={Settings} label="Settings" color="bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300" />
                  </div>
                </div>

                {/* Reviews Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Reviews</h2>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-4 h-4 fill-current" /> 4.8
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((review, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{review.name}</span>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    View All Reviews
                  </button>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Components for cleaner code
const NavItem = ({ icon: Icon, label, active, badge }) => (
  <Link
    to="#"
    className={`
      flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
      ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400'
      }
    `}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
        {badge}
      </span>
    )}
  </Link>
);

const ActionButton = ({ icon: Icon, label, color }) => (
  <button className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}>
    <Icon className="w-6 h-6 mb-2" />
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default DashboardTutor;