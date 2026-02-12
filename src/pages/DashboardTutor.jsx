
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Star, TrendingUp, MessageSquare, BookOpen, DollarSign, Bell, LogOut } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';

const DashboardTutor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      return next;
    });
  };

  const upcomingSessions = [
    { id: 1, title: "React Fundamentals", learners: 12, time: "Today, 2:00 PM", status: "confirmed" },
    { id: 2, title: "Advanced JavaScript", learners: 8, time: "Tomorrow, 4:30 PM", status: "pending" },
    { id: 3, title: "UI/UX Workshop", learners: 15, time: "Dec 24, 11:00 AM", status: "confirmed" },
  ];

  const performanceStats = [
    { label: "Total Students", value: "47", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Rating", value: "4.8/5", change: "+0.2", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Hours Taught", value: "156", change: "+18%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Earnings", value: "$2,840", change: "+22%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className={`min-h-screen bg-linear-to-br from-blue-50 to-white flex ${darkMode ? 'dark bg-slate-900' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between min-h-screen p-6 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src={peerlearnLogo} alt="PeerLearn Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">PeerLearn</span>
          </div>
          <nav className="space-y-2">
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900 dark:text-blue-200">
              <BookOpen className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <Calendar className="w-5 h-5" /> My Sessions
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <Users className="w-5 h-5" /> Students
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <Star className="w-5 h-5" /> Reviews
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 mt-8 relative">
          <img src="https://cdn.lordicon.com/ljvjsnvh.json" alt="Animated Profile Avatar" className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-blue-400 object-cover cursor-pointer" onClick={() => setShowProfileMenu(v => !v)} />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Tutor'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tutor</div>
          </div>
          {showProfileMenu && (
            <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 w-48 z-10">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut className="w-5 h-5" /> Logout
              </button>
              <Link to="/profile" className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900">
                <Users className="w-5 h-5" /> Profile
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-linear-to-br from-blue-50 to-white dark:bg-slate-900">
        {/* Top Bar - Search, Welcome, Profile */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-xl">
            <input type="text" placeholder="Search sessions, students, or topics" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-300" />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <Bell className="w-6 h-6 text-blue-500 cursor-pointer" title="Notifications" />
            <span className="text-slate-700 font-semibold text-lg dark:text-slate-100">Welcome back, {user?.name || 'Tutor'}</span>
            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="User Profile Icon" className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-blue-400 object-cover" />
            <button className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* Accessibility Modal */}
        {showAccessibility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 w-80 relative">
              <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => setShowAccessibility(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Accessibility Settings</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-700 dark:text-slate-200">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={handleThemeToggle}
                    className="sr-only peer"
                  />
                  <div className={`w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-blue-600 transition-colors`}></div>
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`}></span>
                </label>
              </div>
              {/* Add more accessibility toggles here as needed */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 dark:text-slate-200">High Contrast</span>
                <button className="w-12 h-6 flex items-center rounded-full p-1 bg-slate-300 opacity-50 cursor-not-allowed">
                  <span className="h-4 w-4 bg-white rounded-full shadow"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">Text Size</span>
                <button className="w-12 h-6 flex items-center rounded-full p-1 bg-slate-300 opacity-50 cursor-not-allowed">
                  <span className="h-4 w-4 bg-white rounded-full shadow"></span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">More accessibility options coming soon.</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {performanceStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 flex flex-col items-center shadow border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
              <span className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</span>
              <span className="text-slate-500 font-medium mb-2 dark:text-slate-300">{stat.label}</span>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-xs font-semibold text-green-600 mt-2">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
            <Link to="/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage All →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${session.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{session.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.learners} learners
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">Prepare</button>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200">Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex flex-col items-center dark:border-slate-700 dark:hover:bg-slate-900">
              <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Messages</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex flex-col items-center dark:border-slate-700 dark:hover:bg-slate-900">
              <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Materials</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex flex-col items-center dark:border-slate-700 dark:hover:bg-slate-900">
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">Students</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex flex-col items-center dark:border-slate-700 dark:hover:bg-slate-900">
              <Calendar className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex flex-col items-center dark:border-blue-700 dark:hover:bg-blue-900">
              <LogOut className="w-6 h-6 text-red-600 mb-2" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Reviews</h2>
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            {[
              { name: "Alex Chen", comment: "Great explanation of React hooks!", rating: 5 },
              { name: "Maria Garcia", comment: "Very patient and helpful tutor", rating: 5 },
              { name: "David Kim", comment: "Session was well-organized", rating: 4 },
            ].map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{review.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-slate-500'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardTutor;