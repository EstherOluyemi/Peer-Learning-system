// src/pages/DashboardTutor.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Calendar, Star, Trash2,
  Clock, ChevronRight, ArrowUpRight, MessageSquare,
  BookOpen, Settings, AlertCircle, Video, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import CalendarPage from '../components/tutor/CalendarPage';
import { approveEnrollmentRequest, getTutorEnrollmentRequests, normalizeSessionList, rejectEnrollmentRequest } from '../services/sessionService';

const DashboardTutor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    hoursTaught: '0h'
  });
  const [allSessions, setAllSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [upcomingFilter, setUpcomingFilter] = useState('all');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestActionId, setRequestActionId] = useState(null);

  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

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

  useEffect(() => {
    if (!user || user.role !== 'tutor') return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewRes, sessionsRes] = await Promise.all([
          api.get('/v1/tutor/analytics/overview'),
          api.get('/v1/tutor/sessions')
        ]);

        setStats({
          totalStudents: overviewRes.data?.totalStudents || 0,
          hoursTaught: overviewRes.data?.hoursTaught || '0h'
        });

        const sessions = normalizeSessionList(sessionsRes.data || []);
        setAllSessions(sessions);
        setUpcomingSessions(sessions.filter((session) => session.status === 'scheduled' || session.status === 'ongoing'));

        // Fetch recent reviews
        try {
          const reviewsRes = await api.get('/v1/tutor/reviews');
          const reviews = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes?.data && Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
          setRecentReviews(reviews.slice(0, 3));
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setRecentReviews([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'tutor') return;

    const refreshRequests = async () => {
      try {
        const data = await getTutorEnrollmentRequests({ status: 'pending' });
        setPendingRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error refreshing requests:', err);
        setPendingRequests([]);
      }
    };

    const refreshSessions = async () => {
      try {
        const sessionsRes = await api.get('/v1/tutor/sessions');
        const sessions = normalizeSessionList(sessionsRes.data || []);
        setAllSessions(sessions);
        setUpcomingSessions(sessions.filter((session) => session.status === 'scheduled' || session.status === 'ongoing'));
      } catch (err) {
        console.error('Error refreshing sessions:', err);
        setAllSessions([]);
        setUpcomingSessions([]);
      }
    };

    refreshRequests();
    const intervalId = setInterval(() => {
      refreshSessions();
      refreshRequests();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      setDeletingSessionId(sessionId);
      await api.delete(`/v1/tutor/sessions/${sessionId}`);
      setUpcomingSessions(prev => prev.filter(s => s._id !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      setError('Failed to delete session. Please try again.');
      console.error('Error deleting session:', err);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const isSameDay = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

  const isWithinDays = (date, days) => {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + days);
    return date >= now && date <= end;
  };

  const sessionsForList = searchQuery ? allSessions : upcomingSessions;
  const filteredSessions = sessionsForList.filter((session) => {
    const startDate = session.startTime ? new Date(session.startTime) : null;
    if (!startDate) return false;

    if (upcomingFilter === 'today' && !isSameDay(startDate, new Date())) {
      return false;
    }
    if (upcomingFilter === 'week' && !isWithinDays(startDate, 7)) {
      return false;
    }

    if (!searchQuery) return true;
    const haystack = [session.title, session.subject, session.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(searchQuery);
  });

  const recentSessions = [...allSessions]
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || a.startTime || 0);
      const bDate = new Date(b.updatedAt || b.createdAt || b.startTime || 0);
      return bDate - aDate;
    })
    .slice(0, 3);

  const averageRating = recentReviews.length > 0 
    ? (recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length).toFixed(1)
    : '0.0';

  const performanceStats = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Hours Taught", value: stats.hoursTaught, icon: Clock, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Average Rating", value: averageRating, icon: Star, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", link: "/dashboard-tutor/reviews" },
  ];

  const formatRequestTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setRequestActionId(requestId);
      await approveEnrollmentRequest(requestId);
      setPendingRequests((prev) => prev.filter((req) => (req.requestId || req._id || req.id) !== requestId));
    } catch {
      setPendingRequests((prev) => prev.filter((req) => (req.requestId || req._id || req.id) !== requestId));
    } finally {
      setRequestActionId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setRequestActionId(requestId);
      await rejectEnrollmentRequest(requestId);
      setPendingRequests((prev) => prev.filter((req) => (req.requestId || req._id || req.id) !== requestId));
    } catch {
      setPendingRequests((prev) => prev.filter((req) => (req.requestId || req._id || req.id) !== requestId));
    } finally {
      setRequestActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Tutor Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            Welcome back, {user?.name || 'Tutor'}. Manage your sessions and track student progress.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard-tutor/create-session')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Create New Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceStats.map((stat, index) => {
          const CardWrapper = stat.link ? Link : 'div';
          const wrapperProps = stat.link ? { to: stat.link } : {};
          
          return (
            <CardWrapper key={index} {...wrapperProps} className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.link && (
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Enrollment Requests</h2>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {pendingRequests.length} pending
          </span>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No pending enrollment requests.</div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const requestId = request.requestId || request._id || request.id;
              const learnerName = request.learner?.name || request.student?.name || request.learnerName || 'Learner';
              const sessionTitle = request.session?.title || request.sessionTitle || request.sessionName || 'Session';
              const createdAt = formatRequestTime(request.createdAt || request.requestedAt);
              return (
                <div key={requestId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border"
                  style={{ borderColor: 'var(--card-border)' }}>
                  <div className="text-sm">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{learnerName}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{sessionTitle}</div>
                    {createdAt && (
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{createdAt}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(requestId)}
                      disabled={requestActionId === requestId}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(requestId)}
                      disabled={requestActionId === requestId}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl shadow-sm border overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming Sessions</h2>
                <div className="mt-3 flex items-center gap-2">
                  {['all', 'today', 'week'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setUpcomingFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        upcomingFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'This Week'}
                    </button>
                  ))}
                </div>
              </div>
              <Link to="/dashboard-tutor/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => {
                  const startDate = formatDateTime(session.startTime);
                  const endTime = formatDateTime(session.endTime).timeLabel;
                  const participantCount = session.studentIds?.length || 0;
                  const maxParticipants = session.maxParticipants || 0;
                  
                  return (
                    <div key={session._id || session.id} className="p-6 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                            <span className="text-xs font-bold uppercase">{startDate.dayMonth}</span>
                            <span className="text-sm font-bold mt-0.5">{startDate.time}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                {session.title || 'Untitled Session'}
                              </h4>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                                {(session.status || 'scheduled').charAt(0).toUpperCase() + (session.status || 'scheduled').slice(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {session.subject || 'General'}</span>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {participantCount}/{maxParticipants} students</span>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {startDate.time} - {endTime}</span>
                            </div>
                            {session.meetingLink && (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/session/${session._id || session.id}`); }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-2"
                              >
                                <Video className="w-3 h-3" /> Open Session Room
                              </button>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="View session details"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {searchQuery ? 'No sessions found' : 'No upcoming sessions'}
                  </h3>
                  <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {searchQuery
                      ? "We couldn't find any sessions matching your search. Try a different keyword."
                      : "You don't have any sessions scheduled for today. Start by creating a new one!"}
                  </p>
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchParams({})}
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard-tutor/create-session')}
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Create your first session
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Quick Actions */}
        <div className="space-y-8">
          <div className="rounded-2xl shadow-sm border p-6"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                icon={MessageSquare}
                label="Message"
                color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                onClick={() => navigate('/dashboard-tutor/messages')}
              />
              <ActionButton
                icon={BookOpen}
                label="Materials"
                color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                onClick={() => navigate('/dashboard-tutor/materials')}
              />
              <ActionButton
                icon={Calendar}
                label="Schedule"
                color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                onClick={() => setShowCalendarModal(true)}
              />
              <ActionButton
                icon={Settings}
                label="Settings"
                color="bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                onClick={() => navigate('/dashboard-tutor/settings')}
              />
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border p-6"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => {
                  const activityDate = formatDateTime(session.startTime).date;
                  return (
                    <button
                      key={session._id || session.id}
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {session.title || 'Untitled Session'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {activityDate} • {session.subject || 'General'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelectedSession(null)}>
          <div className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {selectedSession.title || 'Session Details'}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedSession.status)}`}>
                    {(selectedSession.status || 'scheduled').charAt(0).toUpperCase() + (selectedSession.status || 'scheduled').slice(1)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                    {selectedSession.subject || 'General'}
                  </span>
                </div>
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
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Participants</h4>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-4 h-4" />
                  <span>
                    {selectedSession.studentIds?.length || 0} / {selectedSession.maxParticipants || 0} enrolled
                    {(selectedSession.maxParticipants - (selectedSession.studentIds?.length || 0)) > 0 && (
                      <span className="text-green-600 dark:text-green-400 ml-1">
                        ({selectedSession.maxParticipants - (selectedSession.studentIds?.length || 0)} spots available)
                      </span>
                    )}
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
                  Session ID: {selectedSession._id || selectedSession.id || 'N/A'}
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
                onClick={() => handleDeleteSession(selectedSession._id)}
                disabled={deletingSessionId === selectedSession._id}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deletingSessionId === selectedSession._id ? 'Deleting...' : 'Delete Session'}
              </button>
              <button
                onClick={() => navigate(`/dashboard-tutor/create-session?edit=${selectedSession._id}`, { state: { sessionData: selectedSession } })}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Edit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowCalendarModal(false)}>
          <div className="w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Session Calendar</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
              <CalendarPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}
  >
    <Icon className="w-6 h-6 mb-2" />
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default DashboardTutor;
