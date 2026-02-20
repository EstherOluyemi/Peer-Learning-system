import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Trash2, Edit2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import { getTutorSessions, deleteSession } from '../services/sessionService';
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
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
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

  const containerClass = highContrast ? 'bg-white text-black' : 'bg-slate-50';
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
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-slate-100 text-slate-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
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

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard-tutor')}
              className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors mb-6 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              Back to Dashboard
            </button>

            <h1 className={`font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`} tabIndex={-1}>
              My Sessions
            </h1>
            <p className={`mt-2 text-slate-600 ${baseFontSize}`}>
              Create and manage your tutoring sessions
            </p>
          </div>

          <button
            onClick={() => navigate('/create-session')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center" role="status" aria-label="Loading sessions">
            <div className="inline-flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              <p className="text-slate-600">Loading your sessions...</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Sessions Yet</h2>
            <p className="text-slate-600 mb-6">Create your first tutoring session to get started!</p>
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
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{session.title || 'Untitled Session'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-3">{session.subject || 'No subject'}</p>

                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span aria-label={`${session.studentIds?.length || 0} participants out of ${session.maxParticipants} maximum`}>
                          {session.studentIds?.length || 0} / {session.maxParticipants} Participants
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard-tutor/create-session?edit=${session._id}`, { state: { sessionData: session } })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      aria-label={`Edit session: ${session.title}`}
                    >
                      <Edit2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(session._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      aria-label={`Delete session: ${session.title}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === session._id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 mb-3">
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
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
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
