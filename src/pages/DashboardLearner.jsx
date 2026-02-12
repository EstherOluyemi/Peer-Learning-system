
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, TrendingUp, Star, Users, Calendar, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import peerlearnLogo from '../assets/peerlearn-logo.png';

const statCards = [
  { icon: BookOpen, label: 'Total Sessions', value: 0 },
  { icon: Clock, label: 'Upcoming', value: 0 },
  { icon: TrendingUp, label: 'Completed', value: 0 },
  { icon: Star, label: 'Average Rating', value: '0.0' },
];

const upcomingSessions = [
  { title: 'Introduction to React Hooks', subject: 'Computer Science', date: '12/20/2024 at 14:00', participants: '8/15' },
  { title: 'Calculus: Derivatives and Applications', subject: 'Mathematics', date: '12/21/2024 at 16:30', participants: '12/12' },
  { title: 'Organic Chemistry Lab Techniques', subject: 'Chemistry', date: '12/22/2024 at 10:00', participants: '6/8' },
];

const recentActivity = [
  { type: 'New session available', detail: 'Advanced React Patterns - Today 2:00 PM' },
  { type: 'Session completed', detail: 'JavaScript Fundamentals - Yesterday' },
  { type: 'New message', detail: 'From Sarah about tomorrow’s session' },
];

const DashboardLearner = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Top Nav */}
      <nav className="w-full bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={peerlearnLogo} alt="PeerLearn Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-700">PeerLearn</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard-learner" className="px-4 py-2 rounded-lg font-medium text-blue-700 bg-blue-100">Dashboard</Link>
          <Link to="/sessions" className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100">Sessions</Link>
          <Link to="/create-session" className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100">Create Session</Link>
          <Link to="/profile" className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100">Profile</Link>
          <Settings className="w-5 h-5 mx-2 text-slate-400 cursor-pointer" />
          <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium">
            <User className="w-5 h-5" /> {user?.name || 'Learner'}
          </span>
          <button onClick={logout} className="ml-2 p-2 rounded-lg hover:bg-slate-100" title="Logout">
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!</h1>
        <p className="text-slate-600 mb-8">Ready to continue your learning journey? Here’s what’s happening today.</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
              <stat.icon className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 mb-6 md:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h2>
              <button className="px-4 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-100 text-sm">View All</button>
            </div>
            <div>
              {upcomingSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b last:border-0 border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">{session.title}</div>
                    <div className="text-slate-500 text-sm">{session.subject}</div>
                    <div className="text-slate-400 text-xs flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> {session.date}</div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users className="w-4 h-4" /> {session.participants}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <button className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg mb-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                <BookOpen className="w-5 h-5" /> Browse Sessions
              </button>
              <button className="w-full border border-slate-200 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-slate-700 hover:bg-slate-100 transition">
                <Star className="w-5 h-5" /> Update Profile
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-2 text-sm">
                {recentActivity.map((item, i) => (
                  <div key={i}>
                    <span className="font-medium text-slate-800">{item.type}</span>
                    <div className="text-slate-500">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLearner;