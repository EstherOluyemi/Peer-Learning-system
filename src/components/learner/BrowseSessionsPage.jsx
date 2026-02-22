// src/components/learner/BrowseSessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, Clock, Users, Star, Plus, X,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle, MapPin, BookOpen,
    TrendingUp, Info, Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BrowseSessionsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [sortBy, setSortBy] = useState('upcoming'); // upcoming, popular, newest
    const [currentPage, setCurrentPage] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [enrolledSessions, setEnrolledSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joiningId, setJoiningId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch all available sessions
                const response = await api.get('/v1/tutor/sessions');
                const sessionsList = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
                setSessions(sessionsList);

                // Fetch learner's enrolled sessions
                try {
                    const enrolledRes = await api.get('/v1/learner/sessions');
                    const enrolledList = Array.isArray(enrolledRes) ? enrolledRes : (enrolledRes?.data && Array.isArray(enrolledRes.data) ? enrolledRes.data : []);
                    setEnrolledSessions(enrolledList.map(s => s._id || s.id));
                } catch (err) {
                    console.log('Could not fetch enrolled sessions:', err);
                    setEnrolledSessions([]);
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
        };

        fetchData();
    }, []);

    // Filter and sort sessions
    const filteredSessions = sessions.filter(session => {
        const matchesSearch = (session.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.tutor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject === 'all' || session.subject === filterSubject;
        const matchesLevel = filterLevel === 'all' || session.level === filterLevel;
        
        return matchesSearch && matchesSubject && matchesLevel;
    });

    // Sort sessions
    const sortedSessions = [...filteredSessions].sort((a, b) => {
        switch (sortBy) {
            case 'upcoming':
                return new Date(a.startTime || 0) - new Date(b.startTime || 0);
            case 'popular':
                return (b.studentIds?.length || 0) - (a.studentIds?.length || 0);
            case 'newest':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
    const currentSessions = sortedSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleJoinSession = async (sessionId) => {
        try {
            setJoiningId(sessionId);
            setError(null);
            await api.post(`/v1/learner/sessions/${sessionId}/join`);
            
            // Update enrolled sessions list
            setEnrolledSessions([...enrolledSessions, sessionId]);
            setSuccessMessage('Successfully joined session!');
            setShowEnrollModal(false);
            
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to join session. Please try again.');
        } finally {
            setJoiningId(null);
        }
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

    const getAvailabilityStatus = (session) => {
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Browse Sessions</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Find and join tutoring sessions - {sortedSessions.length} available
                    </p>
                </div>
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

            {successMessage && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Search and Filters */}
                    <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    <Search className="inline w-4 h-4 mr-2" />
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
                                />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        <Filter className="inline w-4 h-4 mr-2" />
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
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="sortBy" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        <TrendingUp className="inline w-4 h-4 mr-2" />
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
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="priceRange" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        <DollarSign className="inline w-4 h-4 mr-2" />
                                        Max Price: ${priceRange[1]}/hr
                                    </label>
                                    <input
                                        id="priceRange"
                                        type="range"
                                        min="0"
                                        max="200"
                                        step="10"
                                        value={priceRange[1]}
                                        onChange={(e) => {
                                            setPriceRange([0, parseInt(e.target.value)]);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full"
                                    />
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
                                const isFull = availability.status === 'Full';
                                const enrolled = isEnrolled(session._id || session.id);

                                return (
                                    <div
                                        key={session._id}
                                        className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
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
                                                                <Check className="w-3 h-3" /> Enrolled
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
                                                            <BookOpen className="w-3.5 h-3.5" /> {session.subject || 'General'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" /> {date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" /> {time} • {session.duration || 60}min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" /> {session.studentIds?.length || 0}/{session.maxParticipants}
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
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                                {session.tutor.rating.toFixed(1)}
                                                            </span>
                                                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                                ({session.tutor.reviewCount || 0})
                                                            </span>
                                                        </div>
                                                    )}
                                                    {session.tutor?.hourlyRate && (
                                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            ${session.tutor.hourlyRate}/hr
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openDetailsModal(session)}
                                                        className="px-4 py-2 rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
                                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                                    >
                                                        <Info className="w-4 h-4 inline mr-1" />
                                                        Details
                                                    </button>
                                                    
                                                    {enrolled ? (
                                                        <button
                                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-sm font-medium cursor-default"
                                                        >
                                                            Enrolled ✓
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openEnrollModal(session)}
                                                            disabled={isFull || joiningId === session._id}
                                                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                                                isFull
                                                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95'
                                                            }`}
                                                        >
                                                            {joiningId === session._id ? 'Enrolling...' : isFull ? 'Full' : 'Enroll Now'}
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
                                    <Search className="w-8 h-8 text-slate-400" />
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
                                    setCurrentPage(1);
                                }}
                                className="w-full p-3 rounded-lg text-center font-medium transition-all hover:scale-105"
                                style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
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
                            <div className="space-y-2">
                                {subjects.slice(0, 5).map(subject => {
                                    const count = sessions.filter(s => s.subject === subject).length;
                                    return (
                                        <button
                                            key={subject}
                                            onClick={() => {
                                                setFilterSubject(subject);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full p-3 rounded-lg text-left text-sm transition-all hover:scale-105"
                                            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                                        >
                                            <div className="font-medium">{subject}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{count} sessions</div>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {selectedSession.title}
                                </h2>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedSession.subject} • {selectedSession.level}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Session Info */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Calendar, label: 'Date', value: formatDateTime(selectedSession.startTime).date },
                                    { icon: Clock, label: 'Time', value: formatDateTime(selectedSession.startTime).time },
                                    { icon: Users, label: 'Capacity', value: `${selectedSession.studentIds?.length || 0}/${selectedSession.maxParticipants}` },
                                    { icon: Clock, label: 'Duration', value: `${selectedSession.duration || 60} minutes` }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <item.icon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedSession.description || 'No description provided'}
                                </p>
                            </div>

                            {/* Tutor Info */}
                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>About the Tutor</h3>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedSession.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSession.tutor?.name || 'Tutor')}&background=random`}
                                        alt={selectedSession.tutor?.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {selectedSession.tutor?.name || 'Tutor'}
                                        </div>
                                        {selectedSession.tutor?.rating && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{selectedSession.tutor.rating.toFixed(1)}</span>
                                                <span style={{ color: 'var(--text-tertiary)' }}>
                                                    ({selectedSession.tutor.reviewCount || 0} reviews)
                                                </span>
                                            </div>
                                        )}
                                        {selectedSession.tutor?.hourlyRate && (
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                ${selectedSession.tutor.hourlyRate}/hr
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Availability</span>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getAvailabilityStatus(selectedSession).color}`}>
                                        {getAvailabilityStatus(selectedSession).status}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openEnrollModal(selectedSession);
                                }}
                                disabled={getAvailabilityStatus(selectedSession).status === 'Full' || isEnrolled(selectedSession._id || selectedSession.id)}
                                className={`w-full py-3 rounded-lg font-bold transition-all ${
                                    isEnrolled(selectedSession._id || selectedSession.id)
                                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-default'
                                        : getAvailabilityStatus(selectedSession).status === 'Full'
                                        ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isEnrolled(selectedSession._id || selectedSession.id) 
                                    ? 'Already Enrolled' 
                                    : getAvailabilityStatus(selectedSession).status === 'Full' 
                                    ? 'Session is Full' 
                                    : 'Enroll in This Session'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Confirmation Modal */}
            {showEnrollModal && selectedSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Confirm Enrollment</h2>
                            <button
                                onClick={() => setShowEnrollModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {selectedSession.title}
                                </h3>
                                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDateTime(selectedSession.startTime).date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDateTime(selectedSession.startTime).time} • {selectedSession.duration || 60} minutes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{selectedSession.studentIds?.length || 0}/{selectedSession.maxParticipants} enrolled</span>
                                    </div>
                                    {selectedSession.tutor?.hourlyRate && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                ${selectedSession.tutor.hourlyRate}/hour
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                You're about to enroll in this session. You'll receive a confirmation email with session details and a link to join.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEnrollModal(false)}
                                    className="flex-1 py-3 rounded-lg border font-medium transition-all"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleJoinSession(selectedSession._id || selectedSession.id)}
                                    disabled={joiningId === selectedSession._id}
                                    className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {joiningId === selectedSession._id ? 'Enrolling...' : 'Confirm Enrollment'}
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
