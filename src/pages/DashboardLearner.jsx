// src/pages/DashboardLearner.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpen, Clock, TrendingUp, Star, Calendar,
  User, Search, Bell, ChevronRight, AlertCircle, Video, X, Users, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardLearner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSessions: 0,
    upcoming: 0,
    completed: 0,
    hoursLearned: '0h',
    coursesInProgress: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recommendedSessions, setRecommendedSessions] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [leavingSessionId, setLeavingSessionId] = useState(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'TBD', time: '--', dayMonth: 'TBD', timeLabel: '--' };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dayMonth: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timeLabel: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
    } catch {
      return { date: 'Invalid date', time: '--', dayMonth: 'TBD', timeLabel: '--' };
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'scheduled': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'ongoing': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      'completed': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleLeaveSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to leave this session?')) {
      return;
    }

    try {
      setLeavingSessionId(sessionId);
      await api.post(`/v1/learner/sessions/${sessionId}/leave`);
      setUpcomingSessions(prev => prev.filter(s => s._id !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      setError('Failed to leave session. Please try again.');
      console.error('Error leaving session:', err);
    } finally {
      setLeavingSessionId(null);
    }
  };

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
          
          const upcoming = sessionsData.filter(s => s.status === 'scheduled' || s.status === 'upcoming') || [];
          const completed = sessionsData.filter(s => s.status === 'completed') || [];
          
          // Calculate hours learned from completed sessions
          const totalHours = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
          const hoursLearned = totalHours >= 60 ? `${Math.floor(totalHours / 60)}h` : `${totalHours}m`;
          
          setStats({
            totalSessions: sessionsData.length || 0,
            upcoming: upcoming.length || 0,
            completed: completed.length || 0,
            hoursLearned: hoursLearned,
            coursesInProgress: upcoming.length || 0
          });

          setUpcomingSessions(upcoming.slice(0, 3) || []);
          
          // Mock recommended sessions - in production, backend would return personalized recommendations
          const mockRecommended = [
            { title: 'Advanced Python', subject: 'Programming', tutor: 'John Smith', rating: 4.8, students: 120 },
            { title: 'Data Science Fundamentals', subject: 'Data Science', tutor: 'Sarah Lee', rating: 4.9, students: 95 },
            { title: 'Business English', subject: 'English Literature', tutor: 'Emma Wilson', rating: 4.7, students: 78 }
          ];
          setRecommendedSessions(mockRecommended);
          
          // Mock top tutors - in production, backend would return actual tutors
          setTopTutors([
            { name: 'Dr. Alex Johnson', subject: 'Mathematics', rating: 5.0, students: 250, image: '👨‍🏫' },
            { name: 'Prof. Maria Garcia', subject: 'Physics', rating: 4.9, students: 200, image: '👩‍🏫' },
            { name: 'James Wilson', subject: 'Computer Science', rating: 4.8, students: 180, image: '👨‍💻' }
          ]);
        } catch (sessionErr) {
          console.warn('Could not fetch sessions:', sessionErr);
          // Set default empty state
          setStats({
            totalSessions: 0,
            upcoming: 0,
            completed: 0,
            hoursLearned: '0h',
            coursesInProgress: 0
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
    { icon: Clock, label: 'Hours Learned', value: stats.hoursLearned, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: TrendingUp, label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Calendar, label: 'Upcoming', value: stats.upcoming, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
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

      {/* Recommended Sessions Section */}
      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recommended for You</h2>
          <Link to="/dashboard-learner/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {recommendedSessions.map((session, idx) => (
            <div key={idx} className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}
              onClick={() => navigate('/dashboard-learner/sessions')}
            >
              <div className="mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{session.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{session.subject}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{session.rating}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.students} students</p>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>with {session.tutor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tutors Section */}
      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Top Rated Tutors</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {topTutors.map((tutor, idx) => (
            <div key={idx} className="p-4 rounded-xl border text-center transition-all hover:shadow-md"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}
            >
              <div className="text-4xl mb-2">{tutor.image}</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{tutor.name}</h3>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{tutor.subject}</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tutor.students} students</p>
            </div>
          ))}
        </div>
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
                upcomingSessions.map((session, i) => {
                  const startDate = formatDateTime(session.startTime);
                  const endTime = formatDateTime(session.endTime).timeLabel;
                  return (
                    <div key={i} onClick={() => setSelectedSession(session)} className="p-6 cursor-pointer transition-colors" style={{ backgroundColor: 'var(--card-bg)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                            <span className="text-xs font-bold">{startDate.dayMonth}</span>
                            <span className="text-sm font-bold">{startDate.timeLabel}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{session.title || 'Untitled Session'}</h4>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                                {(session.status || 'scheduled').charAt(0).toUpperCase() + (session.status || 'scheduled').slice(1)}
                              </span>
                            </div>
                            {session.subject && (
                              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{session.subject}</p>
                            )}
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{startDate.timeLabel} - {endTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
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
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Learning Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>This Month</p>
                  <p className="text-sm font-bold text-emerald-600">{Math.floor(Math.random() * 80 + 20)}%</p>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Engagement</p>
                  <p className="text-sm font-bold text-blue-600">8/10</p>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
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

    {/* Session Details Modal */}
    {selectedSession && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelectedSession(null)}>
        <div className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }} onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="px-6 py-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedSession.title}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedSession.status)}`}>
                  {(selectedSession.status || 'scheduled').charAt(0).toUpperCase() + (selectedSession.status || 'scheduled').slice(1)}
                </span>
              </div>
              {selectedSession.subject && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedSession.subject}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Description */}
            {selectedSession.description && (
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {selectedSession.description}
                </p>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Start Time</h4>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-4 h-4" />
                  {formatDateTime(selectedSession.startTime).date} at {formatDateTime(selectedSession.startTime).timeLabel}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>End Time</h4>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-4 h-4" />
                  {formatDateTime(selectedSession.endTime).date} at {formatDateTime(selectedSession.endTime).timeLabel}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Session Details</h4>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Users className="w-4 h-4" />
                <span>
                  {selectedSession.studentIds?.length || 0} / {selectedSession.maxParticipants || 0} enrolled
                </span>
              </div>
            </div>

            {selectedSession.meetingLink && (
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Meeting</h4>
                <button
                  onClick={() => navigate(`/session/${selectedSession._id || selectedSession.id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Open Session Room
                </button>
              </div>
            )}

            {/* Session ID */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Session ID: {selectedSession._id || 'N/A'}
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
            <button
              onClick={() => setSelectedSession(null)}
              className="px-4 py-2 rounded-lg border font-medium transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Close
            </button>
            <button
              onClick={() => handleLeaveSession(selectedSession._id)}
              disabled={leavingSessionId === selectedSession._id}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {leavingSessionId === selectedSession._id ? 'Leaving...' : 'Leave Session'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default DashboardLearner;
