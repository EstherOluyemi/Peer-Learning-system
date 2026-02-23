import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, Star, ArrowLeft, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import { getAllSessions, joinSession } from '../services/sessionService';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const BrowseSessionsLearner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { highContrast, textSize } = useAccessibility();

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [joiningSessionId, setJoiningSessionId] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Redirect if not a learner
  useEffect(() => {
    if (user?.role !== 'learner' && user?.role !== 'student') {
      navigate('/dashboard-learner');
    }
  }, [user, navigate]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSessions({}, { role: user?.role });
        setSessions(Array.isArray(data) ? data : []);

        // Extract unique subjects for filter
        const uniqueSubjects = [...new Set(data.map(s => s.subject).filter(Boolean))];
        setSubjects(uniqueSubjects);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user?.role]);

  // Filter sessions based on search and subject
  useEffect(() => {
    let filtered = sessions;

    if (searchQuery) {
      filtered = filtered.filter(
        (session) =>
          session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter((session) => session.subject === filterSubject);
    }

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, filterSubject]);

  const handleJoinSession = async (sessionId) => {
    try {
      setJoiningSessionId(sessionId);
      await joinSession(sessionId);
      setSuccessMessage('Successfully joined session! Redirecting...');
      setTimeout(() => {
        navigate('/my-sessions-learner', { state: { showJoined: true } });
      }, 2000);
    } catch (err) {
      setError(err || 'Failed to join session. Please try again.');
    } finally {
      setJoiningSessionId(null);
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getAvailabilityStatus = (session) => {
    const currentStudents = session.studentIds?.length || 0;
    if (currentStudents >= session.maxParticipants) {
      return { status: 'Full', color: 'text-red-600 bg-red-50' };
    }
    return { status: `${session.maxParticipants - currentStudents} spots left`, color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className={`min-h-screen ${containerClass} transition-colors duration-300`}>
      <AccessibilityToolbar />

      {/* Skip Link */}
      <a 
        href="#sessions-grid" 
        className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to sessions list
      </a>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/dashboard-learner')}
            className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors mb-6 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            Back to Dashboard
          </button>

          <h1 className={`font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`} tabIndex={-1}>
            Browse Sessions
          </h1>
          <p className={`mt-2 text-slate-600 ${baseFontSize}`}>
            Find and join tutoring sessions that match your learning goals
          </p>
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

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                <Search className="inline w-4 h-4 mr-2" aria-hidden="true" />
                Search Sessions
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Search by title or topic..."
                aria-label="Search for sessions by title or topic"
              />
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <div>
                <label htmlFor="subject-filter" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                  <Filter className="inline w-4 h-4 mr-2" aria-hidden="true" />
                  Filter by Subject
                </label>
                <select
                  id="subject-filter"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  aria-label="Filter sessions by subject"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center" role="status" aria-label="Loading sessions">
            <div className="inline-flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              <p className="text-slate-600">Loading sessions...</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Sessions Found</h2>
            <p className="text-slate-600 mb-6">
              {searchQuery || filterSubject
                ? 'Try adjusting your search or filter criteria'
                : 'Check back soon for new sessions!'}
            </p>
            {(searchQuery || filterSubject) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterSubject('');
                }}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div id="sessions-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {filteredSessions.map((session) => {
              const availability = getAvailabilityStatus(session);
              const isFull = availability.status === 'Full';

              return (
                <div
                  key={session._id}
                  role="listitem"
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  {/* Session Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{session.title || 'Untitled'}</h3>
                        <p className="text-sm text-slate-600">{session.subject || 'General'}</p>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${availability.color} mb-4`}>
                      {availability.status}
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <p className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {formatDateTime(session.startTime)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span aria-label={`${session.studentIds?.length || 0} participants out of ${session.maxParticipants} maximum`}>
                          {session.studentIds?.length || 0} / {session.maxParticipants}
                        </span>
                      </p>
                    </div>

                    {/* Description (if available) */}
                    {session.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Tutor Rating (if available) */}
                    {session.tutor?.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="text-sm text-slate-600">
                          {session.tutor.rating.toFixed(1)} ({session.tutor.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinSession(session._id)}
                      disabled={isFull || joiningSessionId === session._id}
                      className={`w-full py-2.5 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600'
                      }`}
                      aria-busy={joiningSessionId === session._id}
                      aria-label={`${isFull ? 'Session full' : 'Join'} - ${session.title}`}
                    >
                      {joiningSessionId === session._id ? 'Joining...' : isFull ? 'Session Full' : 'Join Session'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
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

export default BrowseSessionsLearner;
