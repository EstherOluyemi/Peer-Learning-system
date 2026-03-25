import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Trash2, Edit2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import { getTutorSessions, deleteSession, normalizeSessionList } from '../services/sessionService';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const MySessionsTutor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { highContrast, textSize } = useAccessibility();

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Redirect if not a tutor
  useEffect(() => {
    if (user?.role !== 'tutor') {
      navigate('/dashboard-tutor');
    }
  }, [user, navigate]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const data = await getTutorSessions();
        const normalized = normalizeSessionList(Array.isArray(data) ? data : []);
        setSessions(normalized);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
    const intervalId = setInterval(() => {
      setSessions((prev) => normalizeSessionList(prev));
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      setSuccessMessage('Session deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setError('Failed to delete session. Please try again.');
    }
  };

  const containerClass = highContrast ? 'bg-white text-black' : 'bg-slate-50 dark:bg-slate-900';
  const baseFontSize = textSize === 'large' ? 'text-lg' : 'text-base';

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      completed: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
  };

  return (
    <div className={`min-h-screen ${containerClass} transition-colors duration-300`}>
      <AccessibilityToolbar />

      {/* Skip Link */}
      <a 
        href="#sessions-list" 
        className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to sessions list
      </a>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
               onClick={() => navigate('/dashboard-tutor')}
               className="inline-flex items-center text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors mb-6 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              Back to Dashboard
            </button>

            <h1 className={`font-bold text-slate-900 dark:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`} tabIndex={-1}>
              My Sessions
            </h1>
            <p className={`mt-2 text-slate-600 dark:text-slate-300 ${baseFontSize}`}>
              Create and manage your tutoring sessions
            </p>
          </div>

          <button
            onClick={() => navigate('/create-session')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Create Session</span>
            <span className="sm:hidden">Create</span>
          </button>
        </header>

        {/* Messages */}
        {successMessage && (
          <div 
            className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start"
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div 
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-transparent dark:border-slate-700 p-8 sm:p-12 text-center transition-colors" role="status" aria-live="polite">
            <div className="inline-flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <p className="text-slate-600 dark:text-slate-300">Loading your sessions...</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-transparent dark:border-slate-700 p-8 sm:p-12 text-center transition-colors">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">No Sessions Yet</h2>
            <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-6">Create your first tutoring session to get started!</p>
            <button
              onClick={() => navigate('/create-session')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Create Your First Session
            </button>
          </div>
        ) : (
          <div className="space-y-4" id="sessions-list" role="list">
            {sessions.map((session) => (
              <div
                key={session._id}
                role="listitem"
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg dark:shadow-slate-900/50 transition-shadow p-4 sm:p-6 border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{session.title || 'Untitled Session'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-3">{session.subject || 'No subject'}</p>

                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {session.studentIds?.length || 0} / {session.maxParticipants} Participants
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard-tutor/create-session?edit=${session._id}`, { state: { sessionData: session } })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      aria-label={`Edit session: ${session.title}`}
                    >
                      <Edit2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(session._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      aria-label={`Delete session: ${session.title}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === session._id && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                    <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                      Are you sure you want to delete this session? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(session._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .focus-not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </div>
  );
};

export default MySessionsTutor;

