import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, Star, ArrowLeft, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import { getAllSessions, joinSession } from '../services/sessionService';
import api from '../services/api';
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
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
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

        // Fetch learner's enrolled sessions to check for pending status
        try {
          const enrolledRes = await api.get('/v1/learner/sessions');
          const enrolledList = Array.isArray(enrolledRes) ? enrolledRes : (enrolledRes?.data && Array.isArray(enrolledRes.data) ? enrolledRes.data : []);
          
          // Find sessions with pending status - check all enrollment status fields
          const pending = enrolledList
            .filter(session => {
              const enrollStatus = session.enrollmentStatus || session.requestStatus || session.approvalStatus || session.status;
              return enrollStatus === 'pending';
            })
            .map(session => session._id || session.id);
          
          console.log('Pending enrollments found:', pending);
          setPendingEnrollments(pending);
        } catch (err) {
          console.log('Could not fetch enrolled sessions:', err);
          setPendingEnrollments([]);
        }

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
      setError('');
      
      const response = await joinSession(sessionId);
      
      // Extract response data - API returns { status: "success", data: { status: "pending", ... } }
      const enrollmentData = response?.data?.data || response?.data || response;
      const enrollmentStatus = enrollmentData.status;
      
      // Check the status from API response
      if (enrollmentStatus === 'pending') {
        setPendingEnrollments((prev) => [...prev, sessionId]);
        setSuccessMessage('Enrollment request submitted and is pending approval!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else if (enrollmentStatus === 'approved' || enrollmentStatus === 'enrolled') {
        setSuccessMessage('Successfully enrolled in the session!');
        
        // Navigate to my sessions after 2 seconds for approved enrollments
        setTimeout(() => {
          navigate('/my-sessions-learner', { state: { showJoined: true } });
        }, 2000);
      }
    } catch (err) {
      setError(err || 'Failed to join session. Please try again.');
    } finally {
      setJoiningSessionId(null);
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
      return { status: 'Full', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' };
    }
    return { status: `${session.maxParticipants - currentStudents} spots left`, color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' };
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

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard-learner')}
            className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-6 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            Back to Dashboard
          </button>

          <h1 className={`font-bold text-slate-900 dark:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`} tabIndex={-1}>
            Browse Sessions
          </h1>
          <p className={`mt-2 text-slate-600 dark:text-slate-300 ${baseFontSize}`}>
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-transparent dark:border-slate-700 p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className={`block font-medium text-slate-900 dark:text-white mb-2 ${baseFontSize}`}>
                <Search className="inline w-4 h-4 mr-2" aria-hidden="true" />
                Search Sessions
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-transparent dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
                placeholder="Search by title or topic..."
                aria-label="Search for sessions by title or topic"
              />
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <div>
                <label htmlFor="subject-filter" className={`block font-medium text-slate-900 dark:text-white mb-2 ${baseFontSize}`}>
                  <Filter className="inline w-4 h-4 mr-2" aria-hidden="true" />
                  Filter by Subject
                </label>
                <select
                  id="subject-filter"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
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
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl shadow-lg p-8 sm:p-12 text-center transition-colors" role="status" aria-live="polite">
            <div className="inline-flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <p className="text-slate-600 dark:text-slate-300">Loading sessions...</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl shadow-lg p-8 sm:p-12 text-center transition-colors">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">No Sessions Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
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
          <div id="sessions-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
            {filteredSessions.map((session) => {
              const availability = getAvailabilityStatus(session);
              const isFull = availability.status === 'Full';
              const isPending = pendingEnrollments.includes(session._id);

              return (
                <div
                  key={session._id}
                  role="listitem"
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  {/* Session Header */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1">{session.title || 'Untitled'}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{session.subject || 'General'}</p>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${availability.color} mb-4`}>
                      {availability.status}
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {formatDateTime(session.startTime)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          {session.studentIds?.length || 0} / {session.maxParticipants}
                        </span>
                      </p>
                    </div>

                    {/* Description (if available) */}
                    {session.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Tutor Rating (if available) */}
                    {session.tutor?.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {session.tutor.rating.toFixed(1)} ({session.tutor.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinSession(session._id)}
                      disabled={isFull || joiningSessionId === session._id || isPending}
                      className={`w-full py-2.5 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isFull || isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600'
                      }`}
                      aria-busy={joiningSessionId === session._id}
                      aria-label={`${isFull ? 'Session full' : isPending ? 'Enrollment pending' : 'Join'} - ${session.title}`}
                    >
                      {joiningSessionId === session._id ? 'Enrolling...' : isFull ? 'Session Full' : isPending ? 'Pending Approval' : 'Enroll Now'}
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

