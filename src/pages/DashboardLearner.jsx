// src/pages/DashboardLearner.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { normalizeSessionList } from '../services/sessionService';
import socketService from '../services/socketService';
import {
  BookOpen, Clock, TrendingUp, Star, Calendar,
  User, Search, Bell, ChevronRight, AlertCircle, Video, X, Users, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recommendedSessions, setRecommendedSessions] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [leavingSessionId, setLeavingSessionId] = useState(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  const enrollmentStatusRef = useRef({});

  const closeSelectedSession = useCallback(() => {
    setSelectedSession(null);
  }, []);

  const sessionModalRef = useFocusTrap(Boolean(selectedSession), closeSelectedSession);

  const handleKeyboardActivate = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

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

  const updateSessionStats = (sessionsData) => {
    const upcoming = sessionsData.filter(s => s.status === 'scheduled' || s.status === 'ongoing') || [];
    const completed = sessionsData.filter(s => s.status === 'completed') || [];
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
  };

  useEffect(() => {
    if (!user || (user.role !== 'learner' && user.role !== 'student')) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching learner dashboard data...');
        
        // Try to fetch learner sessions - use the endpoint that exists
        try {
          const sessionsRes = await api.get('/v1/learner/sessions');
          console.log('Learner sessions response:', sessionsRes);
          const normalized = normalizeSessionList(sessionsRes.data || []);
          setSessions(normalized);
          updateSessionStats(normalized);
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

        // Fetch top-rated tutors
        try {
          const tutorsRes = await api.get('/v1/tutors', {
            params: { 
              limit: 3, 
              sortBy: 'rating', 
              order: 'desc' 
            }
          });
          console.log('Top tutors response:', tutorsRes);
          const payload = tutorsRes?.data ?? tutorsRes;
          const tutorsList = Array.isArray(payload?.tutors) 
            ? payload.tutors 
            : Array.isArray(payload?.data) 
              ? payload.data 
              : Array.isArray(payload) 
                ? payload 
                : [];
          
          const mappedTutors = tutorsList.map(tutor => ({
            _id: tutor._id || tutor.id,
            name: tutor.name || tutor.userId?.name || 'Unknown Tutor',
            subject: Array.isArray(tutor.subjects) && tutor.subjects.length > 0 
              ? tutor.subjects[0] 
              : tutor.subject || 'General',
            rating: tutor.rating || tutor.averageRating || 0,
            students: tutor.totalStudents || tutor.studentCount || 0,
            image: tutor.image || tutor.avatar || '👨‍🏫'
          }));
          
          setTopTutors(mappedTutors.slice(0, 3));
        } catch (tutorErr) {
          console.warn('Could not fetch top tutors:', tutorErr);
          // Fallback to empty array or keep loading state
          setTopTutors([]);
        }

        try {
          const recommendationRes = await api.get('/v1/learner/me/recommendations', {
            params: { limit: 6 }
          });
          const payload = recommendationRes?.data ?? recommendationRes;
          const recommendationList = Array.isArray(payload?.recommendations)
            ? payload.recommendations
            : Array.isArray(payload?.data?.recommendations)
              ? payload.data.recommendations
              : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload)
                  ? payload
                  : [];

          const mappedRecommendations = recommendationList.map((item, index) => {
            const sessionData = item?.session || item;
            const tutorData = item?.tutor || sessionData?.tutor || {};
            const title = sessionData?.title || item?.title || 'Recommended Session';
            const subject = sessionData?.subject || item?.subject || 'General';
            const tutorName = tutorData?.name || item?.tutorName || item?.tutor || 'Tutor';
            const rating = Number(item?.tutorRating ?? tutorData?.rating ?? item?.rating ?? 0);
            const students = Number(sessionData?.studentCount ?? sessionData?.studentsCount ?? sessionData?.enrolledCount ?? item?.students ?? 0);

            return {
              id: sessionData?._id || sessionData?.id || item?._id || item?.id || `${title}-${index}`,
              title,
              subject,
              tutor: tutorName,
              rating: Number.isFinite(rating) ? rating.toFixed(1) : '0.0',
              students: Number.isFinite(students) ? students : 0,
            };
          });

          setRecommendedSessions(mappedRecommendations);
        } catch (recommendationError) {
          console.error('Could not fetch recommendations:', recommendationError);
          setRecommendedSessions([]);
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

    const refreshSessions = async () => {
      try {
        const sessionsRes = await api.get('/v1/learner/sessions');
        const normalized = normalizeSessionList(sessionsRes.data || []);
        setSessions(normalized);
        updateSessionStats(normalized);
      } catch (err) {
        console.error('Error refreshing learner sessions:', err);
        setSessions([]);
        updateSessionStats([]);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(() => {
      refreshSessions();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Listen for real-time session enrollment notifications
  useEffect(() => {
    if (!user || (user.role !== 'learner' && user.role !== 'student')) return;

    const handleStudentAdded = (payload) => {
      console.log('Real-time: Added to session', payload);
      const newSession = payload?.session;
      if (newSession) {
        // Add new session to the list
        setSessions(prev => {
          const normalized = normalizeSessionList([...prev, newSession]);
          updateSessionStats(normalized);
          return normalized;
        });
        // Show success notification
        setEnrollmentMessage(`You've been added to ${newSession.title || 'a session'}`);
        setTimeout(() => setEnrollmentMessage(''), 5000);
      }
    };

    const handleStudentRemoved = (payload) => {
      console.log('Real-time: Removed from session', payload);
      const removedSessionId = payload?.session?._id || payload?.session?.id || payload?.sessionId;
      if (removedSessionId) {
        // Remove session from the list
        setSessions(prev => {
          const filtered = prev.filter(s => (s._id || s.id) !== removedSessionId);
          updateSessionStats(filtered);
          return filtered;
        });
        setUpcomingSessions(prev => prev.filter(s => (s._id || s.id) !== removedSessionId));
        // Show notification
        setEnrollmentMessage(`You've been removed from ${payload?.session?.title || 'a session'}`);
        setTimeout(() => setEnrollmentMessage(''), 5000);
      }
    };

    const unsubscribeAdded = socketService.on('session:student-added', handleStudentAdded);
    const unsubscribeRemoved = socketService.on('session:student-removed', handleStudentRemoved);

    return () => {
      unsubscribeAdded();
      unsubscribeRemoved();
    };
  }, [user]);

  const statCards = [
    { icon: BookOpen, label: 'Total Sessions', value: stats.totalSessions, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Clock, label: 'Hours Learned', value: stats.hoursLearned, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: TrendingUp, label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Calendar, label: 'Upcoming', value: stats.upcoming, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  useEffect(() => {
    const getEnrollmentStatus = (session) =>
      session.enrollmentStatus || session.requestStatus || session.approvalStatus;

    let latestMessage = '';
    sessions.forEach((session) => {
      const sessionId = session._id || session.id;
      if (!sessionId) return;
      const current = getEnrollmentStatus(session);
      const previous = enrollmentStatusRef.current[sessionId];
      if (previous && current && previous !== current) {
        if (current === 'approved') {
          latestMessage = `Enrollment approved for ${session.title || 'a session'}`;
        } else if (current === 'rejected') {
          latestMessage = `Enrollment rejected for ${session.title || 'a session'}`;
        }
      }
      enrollmentStatusRef.current[sessionId] = current;
    });

    if (latestMessage) {
      setEnrollmentMessage(latestMessage);
      const timeoutId = setTimeout(() => setEnrollmentMessage(''), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 space-y-6 sm:space-y-8">
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

      {enrollmentMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md flex items-center gap-3" role="status" aria-live="polite">
          <Zap className="w-5 h-5 text-blue-500" />
          <p className="text-blue-700 font-medium">{enrollmentMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Learning Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
          {statCards.map((stat, i) => (
            <article key={i} role="listitem" 
              aria-label={`${stat.label}: ${stat.value}`}
              className="rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`} aria-hidden="true">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recommended Sessions Section */}
      <section aria-labelledby="recommended-heading" className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-4 sm:p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 id="recommended-heading" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recommended for You</h2>
          <Link to="/dashboard-learner/sessions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            View All <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6" role="list">
          {recommendedSessions.length > 0 ? recommendedSessions.map((session) => (
            <article key={session.id} role="listitem" tabIndex={0} 
              aria-label={`Recommended session: ${session.title}, subject: ${session.subject}, tutor: ${session.tutor}, rating: ${session.rating} stars, ${session.students} students`}
              className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}
              onClick={() => navigate('/dashboard-learner/sessions')}
              onKeyDown={(event) => handleKeyboardActivate(event, () => navigate('/dashboard-learner/sessions'))}
            >
              <div className="mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{session.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{session.subject}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                  <span className="sr-only">Rating</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{session.rating}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{session.students} students</p>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>with {session.tutor}</p>
            </article>
          )) : (
            <div className="col-span-full text-sm" style={{ color: 'var(--text-secondary)' }}>
              No recommendations available right now. Explore sessions to help personalize this section.
            </div>
          )}
        </div>
      </section>

      {/* Top Tutors Section */}
      <section aria-labelledby="toptutors-heading" className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 id="toptutors-heading" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Top Rated Tutors</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6" role="list">
          {topTutors.length > 0 ? topTutors.map((tutor, idx) => (
            <article key={tutor._id || idx} role="listitem" tabIndex={0} 
              aria-label={`Tutor: ${tutor.name}, specializes in ${tutor.subject}, rating: ${tutor.rating.toFixed(1)} out of 5 stars, ${tutor.students} student${tutor.students !== 1 ? 's' : ''}`}
              className="p-4 rounded-xl border text-center transition-all hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}
              onClick={() => navigate('/dashboard-learner/browse-sessions', { state: { tutorId: tutor._id } })}
              onKeyDown={(event) => handleKeyboardActivate(event, () => navigate('/dashboard-learner/browse-sessions', { state: { tutorId: tutor._id } }))}
            >
              {tutor.image && (tutor.image.startsWith('http') || tutor.image.startsWith('/')) ? (
                <img 
                  src={tutor.image} 
                  alt={`${tutor.name}'s avatar`}
                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-blue-200 dark:border-blue-800"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl border-2 border-blue-200 dark:border-blue-800 bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800"
                style={{ display: (tutor.image && (tutor.image.startsWith('http') || tutor.image.startsWith('/'))) ? 'none' : 'flex' }}
                aria-hidden="true"
              >
                {tutor.image && !tutor.image.startsWith('http') && !tutor.image.startsWith('/') 
                  ? tutor.image 
                  : tutor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{tutor.name}</h3>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{tutor.subject}</p>
              <div className="flex items-center justify-center gap-1 mb-2" role="img" aria-label={`Rating: ${tutor.rating.toFixed(1)} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(tutor.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`}
                    aria-hidden="true"
                  />
                ))}
                <span className="text-xs ml-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tutor.students} student{tutor.students !== 1 ? 's' : ''}</p>
            </article>
          )) : (
            <div className="col-span-full p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tutors available yet</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl shadow-sm border overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}>
            <div className="p-4 sm:p-6 border-b flex flex-wrap justify-between items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
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
                  const sessionLabel = `Upcoming session: ${session.title || 'Untitled Session'}, subject: ${session.subject || 'Not specified'}, time: ${startDate.timeLabel} to ${endTime}, status: ${session.status || 'scheduled'}`;
                  return (
                    <button key={i} type="button" 
                      aria-label={sessionLabel}
                      onClick={() => setSelectedSession(session)} className="w-full text-left p-4 sm:p-6 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" style={{ backgroundColor: 'var(--card-bg)' }}
                      onKeyDown={(event) => handleKeyboardActivate(event, () => setSelectedSession(session))}
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
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
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
                    </button>
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
          <div className="rounded-2xl shadow-sm border p-4 sm:p-6"
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

          <div className="rounded-2xl shadow-sm border p-4 sm:p-6"
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

          <div className="rounded-2xl shadow-sm border p-4 sm:p-6"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4" onClick={closeSelectedSession}>
        <div ref={sessionModalRef} role="dialog" aria-modal="true" aria-labelledby="learner-session-modal-title" tabIndex={-1} className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }} onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h3 id="learner-session-modal-title" className="text-xl sm:text-2xl font-bold wrap-break-word" style={{ color: 'var(--text-primary)' }}>{selectedSession.title}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedSession.status)}`}>
                  {(selectedSession.status || 'scheduled').charAt(0).toUpperCase() + (selectedSession.status || 'scheduled').slice(1)}
                </span>
              </div>
              {selectedSession.subject && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedSession.subject}</p>
              )}
            </div>
            <button
              onClick={closeSelectedSession}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-h-[70vh] overflow-y-auto">
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
              onClick={closeSelectedSession}
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

