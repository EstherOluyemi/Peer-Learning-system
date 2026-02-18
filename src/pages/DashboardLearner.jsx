// src/pages/DashboardLearner.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpen, Clock, TrendingUp, Star, Calendar,
  User, Search, Bell, ChevronRight, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardLearner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSessions: 0,
    upcoming: 0,
    completed: 0,
    avgRating: '0.0'
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching learner dashboard data...');
        
        // Try to fetch learner sessions - use the endpoint that exists
        try {
          const sessionsRes = await api.get('/v1/learner/sessions');
          console.log('Learner sessions response:', sessionsRes);
          const sessionsData = sessionsRes.data || [];
          
          setStats({
            totalSessions: sessionsData.length || 0,
            upcoming: sessionsData.filter(s => s.status === 'scheduled' || s.status === 'upcoming').length || 0,
            completed: sessionsData.filter(s => s.status === 'completed').length || 0,
            avgRating: '4.8'
          });

          setUpcomingSessions(sessionsData.slice(0, 3) || []);
        } catch (sessionErr) {
          console.warn('Could not fetch sessions:', sessionErr);
          // Set default empty state
          setStats({
            totalSessions: 0,
            upcoming: 0,
            completed: 0,
            avgRating: '0.0'
          });
          setUpcomingSessions([]);
        }
        
        // Mock activity for now as there's no dedicated endpoint yet
        setRecentActivity([
          { id: 1, type: 'System', detail: 'Welcome to PeerLearn!', time: 'Just now', icon: Bell },
        ]);
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { icon: BookOpen, label: 'Total Sessions', value: stats.totalSessions, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Clock, label: 'Upcoming', value: stats.upcoming, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: TrendingUp, label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Star, label: 'Avg Rating', value: stats.avgRating, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! :)
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard-learner/sessions')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Browse Sessions
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

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
              <Link to="/dashboard-learner/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                View Schedule <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session, i) => (
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
                          <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{session.title || 'Untitled Session'}</h4>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{session.tutorName || 'Tutor'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{session.date || 'TBD'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.time || ''}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No upcoming sessions</h3>
                  <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                    You don't have any sessions scheduled. Find a tutor to get started!
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard-learner/sessions')}
                    className="text-sm font-bold text-blue-600 hover:underline"
                  >
                    Find a Tutor
                  </button>
                </div>
              )}
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
              <button 
                onClick={() => navigate('/dashboard-learner/sessions')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <Search className="w-5 h-5" />
                </div>
                Find a Tutor
              </button>
              <button 
                onClick={() => navigate('/dashboard-learner/profile')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                Edit Profile
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 h-fit">
                    <activity.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{activity.detail}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLearner;
