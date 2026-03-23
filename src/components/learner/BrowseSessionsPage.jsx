// src/components/learner/BrowseSessionsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Calendar, Clock, Filter, X, ChevronRight, User, GraduationCap,
    CheckCircle, MessageSquare, AlertCircle, Info, ChevronLeft, Loader2
} from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import api from '../../services/api';
import { getAllSessions } from '../../services/sessionService';
import { useAuth } from '../../context/AuthContext';

const BrowseSessionsPage = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [sortBy, setSortBy] = useState('recommended'); // recommended, upcoming, popular, newest
    const [currentPage, setCurrentPage] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [enrolledSessions, setEnrolledSessions] = useState([]);
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joiningId, setJoiningId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [fullSessionMessage, setFullSessionMessage] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const itemsPerPage = 6;

    // New state for accessibility and UI
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [enrollmentSuccess, setEnrollmentSuccess] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all'); // For quick filters

    const modalRef = useRef(null);
    useFocusTrap(modalRef, showDetailsModal || showEnrollModal);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all available sessions with sortBy parameter for backend smart matching
            const role = user?.role === 'student' ? 'learner' : user?.role;
            const sessionsList = await getAllSessions({ sortBy }, { role });
            setSessions(sessionsList);

            // Fetch learner's enrolled sessions
            try {
                const enrolledRes = await api.get('/v1/learner/sessions');
                const enrolledList = Array.isArray(enrolledRes) ? enrolledRes : (enrolledRes?.data && Array.isArray(enrolledRes.data) ? enrolledRes.data : []);
                
                console.log('Fetched learner sessions:', enrolledList);
                
                // Separate enrolled and pending based on enrollmentStatus, requestStatus, or approvalStatus
                const enrolled = [];
                const pending = [];
                
                enrolledList.forEach(session => {
                    const sessionId = session._id || session.id;
                    // Check all possible enrollment status fields
                    const enrollStatus = session.enrollmentStatus || session.requestStatus || session.approvalStatus || session.status;
                    
                    console.log(`Session ${sessionId}: enrollmentStatus=${session.enrollmentStatus}, requestStatus=${session.requestStatus}, approvalStatus=${session.approvalStatus}, status=${session.status}`);
                    
                    if (enrollStatus === 'pending') {
                        pending.push(sessionId);
                    } else if (enrollStatus === 'approved' || enrollStatus === 'enrolled' || !enrollStatus) {
                        enrolled.push(sessionId);
                    }
                });
                
                setEnrolledSessions(enrolled);
                setPendingEnrollments(pending);
            } catch (err) {
                console.log('Could not fetch enrolled sessions:', err);
                setEnrolledSessions([]);
                setPendingEnrollments([]);
            }

            // Extract unique subjects
            const uniqueSubjects = [...new Set(sessionsList.map(s => s.subject).filter(Boolean))];
            setSubjects(uniqueSubjects);
        } catch (err) {
            setError('Failed to load sessions. Please try again later.');
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.role, sortBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData, sortBy]);

    // Filter sessions (backend now handles sorting via smart matching)
    const filteredSessions = sessions.filter(session => {
        const matchesSearch = (session.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.tutor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject === 'all' || session.subject === filterSubject;
        const matchesLevel = filterLevel === 'all' || session.level === filterLevel;

        return matchesSearch && matchesSubject && matchesLevel;
    });

    // Backend handles sorting now, so we just use filteredSessions directly
    // (sortBy parameter is passed to API for smart matching)
    const sortedSessions = filteredSessions;

    const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
    const currentSessions = sortedSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleJoinSession = async (sessionId) => {
        if (!sessionId || isEnrolled(sessionId) || isPending(sessionId)) {
            return;
        }
        try {
            setJoiningId(sessionId);
            setEnrollmentError(null);
            
            const response = await api.post(`/v1/learner/sessions/${sessionId}/join`);
            
            // Extract response data - API returns { status: "success", data: { status: "pending", ... } }
            const enrollmentData = response?.data?.data || response?.data || response;
            const enrollmentStatus = enrollmentData.status;
            
            // Check the status from API response
            if (enrollmentStatus === 'pending') {
                setPendingEnrollments((prev) => [...prev, sessionId]);
                setEnrollmentSuccess('Enrollment request submitted and is pending approval!');
                setShowEnrollModal(false);
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setEnrollmentSuccess('');
                }, 3000);
            } else if (enrollmentStatus === 'approved' || enrollmentStatus === 'enrolled') {
                setEnrolledSessions((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
                setEnrollmentSuccess('Successfully enrolled in the session!');
                setShowEnrollModal(false);
                
                await fetchData();
                
                setTimeout(() => {
                    setEnrollmentSuccess('');
                }, 3000);
            }
        } catch (err) {
            console.error('Join session error:', err);
            setEnrollmentError(err.response?.data?.message || err.message || 'Failed to join session. Please try again.');
        } finally {
            setJoiningId(null);
        }
    };

    const handleEnrollAction = (session) => {
        const availability = getAvailabilityStatus(session);
        if (availability.status === 'Full') {
            setFullSessionMessage('This session is full. Please choose another session.');
            setTimeout(() => setFullSessionMessage(''), 3000);
            return;
        }
        openEnrollModal(session);
    };

    const openEnrollModal = (session) => {
        setSelectedSession(session);
        setShowEnrollModal(true);
    };

    const openDetailsModal = (session) => {
        setSelectedSession(session);
        setShowDetailsModal(true);
    };

    const isEnrolled = (sessionId) => {
        return enrolledSessions.includes(sessionId);
    };

    const isPending = (sessionId) => {
        return pendingEnrollments.includes(sessionId);
    };

    const getAvailabilityStatus = (session) => {
        let isPast = false;
        if (session.startTime) {
            const end = new Date(session.endTime || new Date(new Date(session.startTime).getTime() + (session.duration || 60) * 60000));
            if (end < new Date()) {
                isPast = true;
            }
        }

        if (session.status === 'completed' || isPast) {
            return { status: 'Completed', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
        }

        if (session.status === 'cancelled') {
            return { status: 'Cancelled', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
        }

        const currentStudents = session.studentIds?.length || 0;
        const spotsLeft = session.maxParticipants - currentStudents;

        if (spotsLeft <= 0) {
            return { status: 'Full', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        } else if (spotsLeft <= 2) {
            return { status: `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left!`, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
        }
        return { status: `${spotsLeft} spots available`, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    };

    const formatDateTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        } catch {
            return { date: 'TBD', time: '--' };
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return 'Date TBD';
        }
    };

    const formatTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return 'Time TBD';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Browse Sessions</h1>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4" aria-live="polite">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Showing <span className="font-bold text-blue-600">{filteredSessions.length}</span> sessions
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                                aria-pressed={viewMode === 'grid'}
                            >
                                <Filter className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-600' : ''}`} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400" aria-live="assertive">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {enrollmentError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400" aria-live="assertive">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <p className="text-sm font-medium">{enrollmentError}</p>
                </div>
            )}

            {enrollmentSuccess && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-700 dark:text-green-400" aria-live="assertive">
                    <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <p className="text-sm font-medium">{enrollmentSuccess}</p>
                </div>
            )}

            {fullSessionMessage && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 text-amber-800 shadow-lg dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <p className="text-sm font-medium">{fullSessionMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Search and Filters */}
                    <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    <Search className="inline w-4 h-4 mr-2" aria-hidden="true" />
                                    Search Sessions
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by title, topic, or tutor..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2.5 border-none rounded-lg text-sm"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        color: 'var(--input-text)',
                                    }}
                                    aria-label="Search sessions"
                                />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        <Filter className="inline w-4 h-4 mr-2" aria-hidden="true" />
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        value={filterSubject}
                                        onChange={(e) => {
                                            setFilterSubject(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-4 py-2.5 border-none rounded-lg text-sm"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                        }}
                                        aria-label="Filter by subject"
                                    >
                                        <option value="all">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="level" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Level
                                    </label>
                                    <select
                                        id="level"
                                        value={filterLevel}
                                        onChange={(e) => {
                                            setFilterLevel(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-4 py-2.5 border-none rounded-lg text-sm"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                        }}
                                        aria-label="Filter by level"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="sortBy" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        <Loader2 className="inline w-4 h-4 mr-2" aria-hidden="true" />
                                        Sort By
                                    </label>
                                    <select
                                        id="sortBy"
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-4 py-2.5 border-none rounded-lg text-sm"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                        }}
                                        aria-label="Sort sessions by"
                                    >
                                        <option value="recommended">Recommended for You</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading sessions...</p>
                            </div>
                        ) : currentSessions.length > 0 ? (
                            currentSessions.map(session => {
                                const availability = getAvailabilityStatus(session);
                                const { date, time } = formatDateTime(session.startTime);
                                const sessionId = session._id || session.id;
                                const isFull = availability.status === 'Full';
                                const enrolled = isEnrolled(sessionId);
                                const pending = isPending(sessionId);

                                return (
                                    <div
                                        key={sessionId}
                                        className="p-4 sm:p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                                        style={{
                                            backgroundColor: 'var(--card-bg)',
                                            borderColor: 'var(--card-border)'
                                        }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Left Side - Session Details */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <span className="text-xs font-bold uppercase">{date?.split(' ')[0] || 'TBD'}</span>
                                                    <span className="text-lg font-bold">{date?.split(' ')[1] || '--'}</span>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                                            {session.title}
                                                        </h4>
                                                        {enrolled && (
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" aria-hidden="true" /> Enrolled
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${availability.color}`}>
                                                            {availability.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                                        {session.description || 'No description provided'}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> {session.subject || 'General'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> {date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {time} • {session.duration || 60}min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" aria-hidden="true" /> {session.studentIds?.length || 0}/{session.maxParticipants}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side - Tutor Info & Actions */}
                                            <div className="flex flex-col gap-3 items-end">
                                                <div className="text-right">
                                                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                        by {session.tutor?.name || 'Tutor'}
                                                    </div>
                                                    {session.tutor?.rating && (
                                                        <div className="flex items-center justify-end gap-1 mb-1">
                                                            <Info className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                {session.tutor.rating.toFixed(1)}
                                                            </span>
                                                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                                ({session.tutor.reviewCount || 0})
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openDetailsModal(session)}
                                                        className="px-4 py-2 rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
                                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                                        aria-label={`View details for ${session.title}`}
                                                    >
                                                        <Info className="w-4 h-4 inline mr-1" aria-hidden="true" />
                                                        Details
                                                    </button>

                                                    {enrolled ? (
                                                        <button
                                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-sm font-medium cursor-default"
                                                            aria-label={`Enrolled in ${session.title}`}
                                                            disabled
                                                        >
                                                            Enrolled ✓
                                                        </button>
                                                    ) : pending ? (
                                                        <button
                                                            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-sm font-medium cursor-not-allowed"
                                                            disabled
                                                            aria-label={`Enrollment pending for ${session.title}`}
                                                        >
                                                            Pending Approval
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEnrollAction(session)}
                                                            disabled={joiningId === sessionId || isFull || availability.status === 'Completed' || availability.status === 'Cancelled'}
                                                            aria-disabled={isFull || availability.status === 'Completed' || availability.status === 'Cancelled'}
                                                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${(isFull || availability.status === 'Completed' || availability.status === 'Cancelled')
                                                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95'
                                                                }`}
                                                            aria-label={isFull ? `Session ${session.title} is full` : availability.status === 'Completed' ? `Session ${session.title} completed` : availability.status === 'Cancelled' ? `Session ${session.title} cancelled` : `Enroll in ${session.title}`}
                                                        >
                                                            {joiningId === sessionId ? 'Enrolling...' : isFull ? 'Full' : availability.status === 'Completed' ? 'Completed' : availability.status === 'Cancelled' ? 'Cancelled' : 'Enroll Now'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <Search className="w-8 h-8 text-slate-400" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No sessions found</h3>
                                <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                    No sessions match your criteria. Try adjusting your filters.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex justify-center items-center gap-2" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                            </button>

                            <div className="flex gap-1" aria-label={`Page ${currentPage} of ${totalPages}`}>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        aria-current={currentPage === i + 1 ? 'page' : undefined}
                                        aria-label={`Go to page ${i + 1}`}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        style={currentPage !== i + 1 ? { color: 'var(--text-primary)' } : {}}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </nav>
                    )}
                </div>

                {/* Right Sidebar - Stats */}
                <div className="space-y-6">
                    <div className="rounded-2xl shadow-sm border p-6"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Filters</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setFilterSubject('all');
                                    setFilterLevel('all');
                                    setSearchTerm('');
                                    setSelectedSubject('all');
                                    setCurrentPage(1);
                                }}
                                className="w-full p-3 rounded-lg text-center font-medium transition-all hover:scale-105"
                                style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                                aria-label="Reset all filters"
                            >
                                Reset Filters
                            </button>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <strong>Total Available:</strong> {sessions.length} sessions
                            </div>
                        </div>
                    </div>

                    {subjects.length > 0 && (
                        <div className="rounded-2xl shadow-sm border p-6"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--card-border)'
                            }}
                        >
                            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Popular Subjects</h3>
                            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
                                {subjects.map(subject => {
                                    const count = sessions.filter(s => s.subject === subject).length;
                                    return (
                                        <button
                                            key={subject}
                                            onClick={() => {
                                                setFilterSubject(subject);
                                                setSelectedSubject(subject);
                                                setCurrentPage(1);
                                            }}
                                            aria-pressed={selectedSubject === subject}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSubject === subject
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                            aria-label={`Filter by ${subject} (${count} sessions)`}
                                        >
                                            {subject} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Session Details Modal */}
            {showDetailsModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="details-modal-title"
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200"
                        style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mb-2 inline-block">
                                        {selectedSession.subject}
                                    </span>
                                    <h2 id="details-modal-title" className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {selectedSession.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    aria-label="Close details"
                                >
                                    <X className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Schedule</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {formatDate(selectedSession.startTime)} at {formatTime(selectedSession.startTime)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {selectedSession.duration || 60} minutes duration
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <User className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Tutor</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {selectedSession.tutor?.name || 'Academic Tutor'}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        Tutor Level: Gold Member
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedSession.description || 'No description provided'}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>What you'll learn</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedSession.tags || ['Study Session', 'Peer Learning', 'Knowledge Share']).map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            • {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowEnrollModal(true);
                                    }}
                                    className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                                    aria-label={`Enroll in ${selectedSession.title}`}
                                >
                                    Enroll in Session
                                </button>
                                <button
                                    className="flex-1 px-8 py-4 rounded-2xl font-bold border transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    aria-label="Message tutor"
                                >
                                    Message Tutor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Confirmation Modal */}
            {showEnrollModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEnrollModal(false)} />
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="enroll-modal-title"
                        className="relative w-full max-w-md rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden"
                        style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                        <div className="p-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                                <GraduationCap className="w-8 h-8" aria-hidden="true" />
                            </div>
                            <h2 id="enroll-modal-title" className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Confirm Enrollment
                            </h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                You are about to enroll in <span className="font-bold text-blue-600">{selectedSession.title}</span>.
                                This will reserve your spot and add it to your schedule.
                            </p>

                            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border mb-8" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(selectedSession.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatTime(selectedSession.startTime)}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowEnrollModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold border transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleJoinSession(selectedSession._id || selectedSession.id)}
                                    disabled={joiningId === selectedSession._id}
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {joiningId === selectedSession._id ? 'Enrolling...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseSessionsPage;
