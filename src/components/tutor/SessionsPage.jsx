// src/components/tutor/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Calendar, Users, Clock, Edit, Trash2, Plus, Search, Filter,
  ChevronLeft, ChevronRight, Eye, MessageSquare, Star, AlertCircle, Video, X
} from 'lucide-react';
import api from '../../services/api';
import { normalizeSessionList } from '../../services/sessionService';
import { useAuth } from '../../context/AuthContext';

const SessionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [quickStats, setQuickStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    scheduled: 0
  });
  const itemsPerPage = 8;

  // Redirect to edit page if edit param is present
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;

    const stateSession = location.state?.sessionData;
    const sessionFromList = sessions.find(
      (session) => (session._id || session.id) === editId
    );
    const sessionData = stateSession || sessionFromList;

    navigate(`/dashboard-tutor/create-session?edit=${editId}`, {
      replace: true,
      state: sessionData ? { sessionData } : undefined
    });
  }, [searchParams, navigate, location.state, sessions]);

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

  useEffect(() => {
    if (!user || user.role !== 'tutor') return;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/sessions');
        const allSessions = normalizeSessionList(response.data || []);
        setSessions(allSessions);

        // Calculate quick stats
        setQuickStats({
          total: allSessions.length,
          ongoing: allSessions.filter(s => s.status === 'ongoing').length,
          completed: allSessions.filter(s => s.status === 'completed').length,
          scheduled: allSessions.filter(s => s.status === 'scheduled').length
        });
      } catch (err) {
        setError('Failed to fetch your sessions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    const intervalId = setInterval(() => {
      setSessions((prev) => {
        const normalized = normalizeSessionList(prev);
        setQuickStats({
          total: normalized.length,
          ongoing: normalized.filter(s => s.status === 'ongoing').length,
          completed: normalized.filter(s => s.status === 'completed').length,
          scheduled: normalized.filter(s => s.status === 'scheduled').length
        });
        return normalized;
      });
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
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      setError('Failed to delete session. Please try again.');
      console.error('Error deleting session:', err);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = (session.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const currentSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    const statusMap = {
      'scheduled': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'ongoing': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      'completed': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Sessions</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your tutoring sessions and student bookings.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard-tutor/create-session')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Session
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  borderColor: 'var(--input-border)'
                }}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'scheduled', 'ongoing', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading sessions...</p>
              </div>
            ) : currentSessions.length > 0 ? (
              currentSessions.map(session => {
                const startDate = formatDateTime(session.startTime);
                const endTime = formatDateTime(session.endTime).timeLabel;
                const participantCount = session.studentIds?.length || 0;
                
                return (
                  <div
                    key={session._id}
                    onClick={() => setSelectedSession(session)}
                    className="cursor-pointer p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                          <span className="text-xs font-bold">{startDate.dayMonth}</span>
                          <span className="text-lg font-bold">{startDate.timeLabel}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{session.title || 'Untitled Session'}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                              {(session.status || 'scheduled').charAt(0).toUpperCase() + (session.status || 'scheduled').slice(1)}
                            </span>
                          </div>
                          {session.subject && (
                            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{session.subject}</p>
                          )}
                          {session.description && (
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{session.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {participantCount}/{session.maxParticipants || 0} students</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {startDate.timeLabel} - {endTime}</span>
                            {session.meetingLink && (
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><Video className="w-3.5 h-3.5" /> Video call</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No sessions found</h3>
                <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  You don't have any sessions matching your filters.
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl shadow-sm border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{quickStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Ongoing</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{quickStats.ongoing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
                <span className="font-bold text-slate-600 dark:text-slate-400">{quickStats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Scheduled</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{quickStats.scheduled}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming</h3>
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'scheduled').slice(0, 3).map(session => {
                const startDate = formatDateTime(session.startTime);
                return (
                  <div key={session._id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{startDate.date} at {startDate.timeLabel}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                );
              })}
              {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No upcoming scheduled sessions.</p>
              )}
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
                    disabled={selectedSession.status === 'completed'}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
                      selectedSession.status === 'completed'
                        ? 'bg-slate-400 cursor-not-allowed opacity-60 shadow-none'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {selectedSession.status === 'completed' ? 'Session Completed' : 'Open Session Room'}
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
    </div>
  );
};

export default SessionsPage;
