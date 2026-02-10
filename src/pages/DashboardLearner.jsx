import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, PlayCircle, Calendar, BookOpen, Award, TrendingUp, Settings2 } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';

const avatar = 'https://randomuser.me/api/portraits/women/44.jpg';

const DashboardLearner = () => {
  const { user } = useAuth();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode (for demo, toggles a class on body)
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

  return (
    <div className={`min-h-screen bg-linear-to-br from-blue-50 to-white flex ${darkMode ? 'dark bg-slate-900' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between min-h-screen p-6 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {/* Use peerlearn-logo from assets */}
            <img src={peerlearnLogo} alt="PeerLearn Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">PeerLearn</span>
          </div>
          <nav className="space-y-2">
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900 dark:text-blue-200">
              <BookOpen className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <Calendar className="w-5 h-5" /> My Classes
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <Award className="w-5 h-5" /> Achievements
            </Link>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
              <TrendingUp className="w-5 h-5" /> Progress
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 mt-8">
          <img src={avatar} alt="User" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Ava Lee'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">120 Points</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-linear-to-br from-blue-50 to-white dark:bg-slate-900">
        {/* Top Bar - Search, Accessibility, Profile */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-xl">
            <input type="text" placeholder="Search by topic, title, or name" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-300" />
          </div>
          <div className="flex items-center gap-4 ml-6">
            {/* Welcome and Profile */}
            <span className="text-slate-700 font-semibold text-lg dark:text-slate-100">Welcome back, {user?.name || 'Ava Lee'}</span>
            <img src="https://cdn-icons-png.flaticon.com/512/201/201818.png" alt="Student Profile Icon" className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-blue-400 object-cover" />
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

        {/* Captivating Content Section (replaces Premium) */}
        <div className="bg-gradient-to-r from-blue-200 via-blue-100 to-purple-100 rounded-2xl p-8 flex items-center justify-between mb-8 shadow-md dark:bg-gradient-to-r dark:from-blue-900 dark:via-blue-800 dark:to-purple-900">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Featured Content</h2>
            <p className="text-slate-600 dark:text-slate-200 mb-4">“Learning never exhausts the mind.” — Leonardo da Vinci</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Explore Now</button>
          </div>
          <img src="https://assets-v2.lottiefiles.com/a/0b7e2e2e-2e2e-11e9-8b3b-06b79b628af2/0b7e2e2e-2e2e-11e9-8b3b-06b79b628af2.gif" alt="Featured" className="h-32 w-32 object-contain" />
        </div>

        {/* ...existing stats row, continue watching, daily quest, events... */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="text-3xl font-bold text-blue-700 mb-1 dark:text-blue-300">05/08</span>
            <span className="text-slate-500 font-medium mb-2 dark:text-slate-300">Courses</span>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="text-3xl font-bold text-purple-700 mb-1 dark:text-purple-300">80/100</span>
            <span className="text-slate-500 font-medium mb-2 dark:text-slate-300">Points Earned</span>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <span className="text-3xl font-bold text-blue-700 mb-1 dark:text-blue-300">75%</span>
            <span className="text-slate-500 font-medium mb-2 dark:text-slate-300">Progress</span>
            <svg className="w-12 h-12" viewBox="0 0 36 36"><path className="text-blue-200 dark:text-blue-900" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32z"/><path className="text-blue-600 dark:text-blue-400" strokeWidth="4" strokeDasharray="75,100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32z"/></svg>
          </div>
        </div>

        {/* Continue Watching */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Continue Watching</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80" alt="UX/UI" className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="font-semibold text-slate-900 mb-1">UX/UI for Beginners</div>
                <div className="text-xs text-slate-500 mb-2">UI & UX Mastery: Design for Everyone</div>
                <button className="flex items-center gap-2 text-blue-600 font-medium text-sm mt-2"><PlayCircle className="w-4 h-4" /> Continue</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80" alt="Web Design" className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="font-semibold text-slate-900 mb-1">Responsive Web Design</div>
                <div className="text-xs text-slate-500 mb-2">Create Mobile-First Websites from Scratch</div>
                <button className="flex items-center gap-2 text-blue-600 font-medium text-sm mt-2"><PlayCircle className="w-4 h-4" /> Continue</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" alt="Prototyping" className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="font-semibold text-slate-900 mb-1">Framer Essentials</div>
                <div className="text-xs text-slate-500 mb-2">Build Interactive Prototypes Like a Pro</div>
                <button className="flex items-center gap-2 text-blue-600 font-medium text-sm mt-2"><PlayCircle className="w-4 h-4" /> Continue</button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Quest */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow border border-slate-100 col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Quest</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Log in 5 Days Straight</div>
                  <div className="text-xs text-slate-500">+15 Points</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-semibold">5/5 Completed</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Ace 3 Quiz Without Retry</div>
                  <div className="text-xs text-slate-500">+15 Points</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-semibold">1/3 Completed</span>
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
              </div>
            </div>
          </div>
          {/* Events */}
          <div className="bg-white rounded-xl p-6 shadow border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Events</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">UI Basics Quiz</div>
                  <div className="text-xs text-slate-500">5 quick MCQs on design</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Framer Homework</div>
                  <div className="text-xs text-slate-500">Node & Wireframe</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">CSS Live Code</div>
                  <div className="text-xs text-slate-500">Create interactive card</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLearner;