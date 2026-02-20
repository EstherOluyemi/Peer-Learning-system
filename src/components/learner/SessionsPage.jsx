// src/components/learner/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, Star, Search, Filter, Plus,
    ChevronLeft, ChevronRight, Eye, MessageSquare, Bookmark,
    TrendingUp, TrendingDown, MapPin, Video, BookOpen, AlertCircle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SessionsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [leavingSessionId, setLeavingSessionId] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                console.log('Fetching enrolled sessions...');
                const response = await api.get('/v1/learner/sessions');
                console.log('Enrolled sessions response:', response);
                const sessionsData = response.data || [];
                setSessions(sessionsData);
            } catch (err) {
                setError('Failed to fetch your sessions. Please try again later.');
                console.error('Error fetching sessions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleLeaveSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to leave this session?')) {
            return;
        }

        try {
            setLeavingSessionId(sessionId);
            setError(null);
            await api.post(`/v1/learner/sessions/${sessionId}/leave`);
            
            // Remove session from local state
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            setSuccessMessage('Successfully left the session');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to leave session. Please try again.');
            console.error('Error leaving session:', err);
        } finally {
            setLeavingSessionId(null);
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = (session.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.tutorName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || (session.type || '').toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const currentSessions = filteredSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming':
            case 'scheduled': 
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'ongoing':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'completed': 
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'cancelled': 
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: 
                return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: 'TBD', time: '--', dayMonth: 'TBD', hour: '--' };
        try {
            const date = new Date(dateString);
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                dayMonth: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hour: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            };
        } catch {
            return { date: 'Invalid date', time: '--', dayMonth: 'TBD', hour: '--' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Sessions</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your learning sessions and track progress.</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard-learner/browse-sessions')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Browse Sessions
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-700 dark:text-green-400">
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search sessions, subjects, or tutors..."
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
                            {['all', 'workshop', '1-on-1', 'group'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${filterType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
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
                                const endDate = formatDateTime(session.endTime);
                                
                                return (
                                <div
                                    key={session._id || session.id}
                                    className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderColor: 'var(--card-border)'
                                    }}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <span className="text-xs font-bold uppercase">{startDate.dayMonth.split(' ')[0]}</span>
                                                <span className="text-lg font-bold">{startDate.dayMonth.split(' ')[1]}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                        {session.title || 'Untitled Session'}
                                                    </h4>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status || 'upcoming')}`}>
                                                        {(session.status || 'scheduled').charAt(0).toUpperCase() + (session.status || 'scheduled').slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{session.description || 'No description available'}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {session.subject || 'General'}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {startDate.date}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {startDate.time} - {endDate.time}</span>
                                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {session.studentIds?.length || 0}/{session.maxParticipants || 0}</span>
                                                    {session.meetingLink && (
                                                        <a 
                                                            href={session.meetingLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                                        >
                                                            <Video className="w-3.5 h-3.5" /> Join
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setSelectedSession(session)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="Message tutor"
                                                >
                                                    <MessageSquare className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleLeaveSession(session._id || session.id)}
                                                disabled={leavingSessionId === (session._id || session.id)}
                                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {leavingSessionId === (session._id || session.id) ? 'Leaving...' : 'Leave Session'}
                                            </button>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.rating || '5.0'}</span>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{session.studentIds?.length || 0}/{session.maxParticipants || 0} enrolled</span>
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
                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {searchTerm || filterType !== 'all' ? 'No sessions found' : 'No enrolled sessions yet'}
                                </h3>
                                <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    {searchTerm || filterType !== 'all' 
                                        ? "We couldn't find any sessions matching your filters. Try adjusting your search." 
                                        : "You haven't joined any sessions yet. Browse available sessions to get started!"}
                                </p>
                                {!searchTerm && filterType === 'all' && (
                                    <button
                                        onClick={() => navigate('/dashboard-learner/browse-sessions')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                                    >
                                        <Search className="w-4 h-4" />
                                        Browse Sessions
                                    </button>
                                )}
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
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Session Overview</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg text-center"
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">8</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Upcoming</div>
                                </div>
                                <div className="p-3 rounded-lg text-center"
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">4</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completed</div>
                                </div>
                                <div className="p-3 rounded-lg text-center"
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">3</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Workshops</div>
                                </div>
                                <div className="p-3 rounded-lg text-center"
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">5</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>1-on-1</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl shadow-sm border p-6"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions</span>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Average Rating</span>
                                <span className="font-bold text-yellow-600">4.8</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Hours</span>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>24</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Spent</span>
                                <span className="font-bold text-green-600 dark:text-green-400">$480</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl shadow-sm border p-6"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Popular Subjects</h3>
                        <div className="space-y-3">
                            {['Computer Science', 'Mathematics', 'Chemistry', 'Physics'].map(subject => (
                                <div key={subject} className="flex items-center justify-between p-3 rounded-lg"
                                    style={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <div>
                                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{subject}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>3-5 sessions available</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Explore</div>
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
                                    {formatDateTime(selectedSession.startTime).date} at {formatDateTime(selectedSession.startTime).time}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>End Time</h4>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <Clock className="w-4 h-4" />
                                    {formatDateTime(selectedSession.endTime).date} at {formatDateTime(selectedSession.endTime).time}
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

                        {/* Meeting Link */}
                        {selectedSession.meetingLink && (
                            <div>
                                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Meeting Link</h4>
                                <a
                                    href={selectedSession.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <Video className="w-4 h-4" />
                                    Join Video Call
                                </a>
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
                            onClick={() => {
                                handleLeaveSession(selectedSession._id);
                                setSelectedSession(null);
                            }}
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

export default SessionsPage;