// src/components/learner/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, Star, Search, Filter, Plus,
    ChevronLeft, ChevronRight, Eye, MessageSquare, Bookmark,
    TrendingUp, TrendingDown, MapPin, Video, BookOpen, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const SessionsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const response = await api.get('/v1/learner/courses?enrolled=true');
                // The API might return sessions in a slightly different format, 
                // but we'll map them to what the UI expects or adjust the UI.
                setSessions(response.data || []);
            } catch (err) {
                setError('Failed to fetch your sessions. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = (session.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (session.tutorName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || (session.type || '').toLowerCase() === filterType.toLowerCase();
        const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const currentSessions = filteredSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Workshop': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case '1-on-1': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Group': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Sessions</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your learning sessions and track progress.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Browse Sessions
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
                                placeholder="Search sessions, subjects, or tutors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
                            currentSessions.map(session => (
                                <div
                                    key={session.id}
                                    className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderColor: 'var(--card-border)'
                                    }}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <span className="text-xs font-bold uppercase">{session.date?.split(' ')[0] || 'TBD'}</span>
                                                <span className="text-lg font-bold">{session.time?.split(':')[0] || '--'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                        {session.title}
                                                    </h4>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(session.type || 'Workshop')}`}>
                                                        {session.type || 'Workshop'}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(session.level || 'Beginner')}`}>
                                                        {session.level || 'Beginner'}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status || 'upcoming')}`}>
                                                        {(session.status || 'upcoming').charAt(0).toUpperCase() + (session.status || 'upcoming').slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{session.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                    <div className="flex items-center gap-1">
                                                        <img
                                                            src={session.tutorAvatar || `https://ui-avatars.com/api/?name=${session.tutorName || 'Tutor'}&background=random`}
                                                            alt={session.tutorName || 'Tutor'}
                                                            className="w-5 h-5 rounded-full"
                                                        />
                                                        <span>{session.tutorName || 'Unknown Tutor'}</span>
                                                    </div>
                                                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {session.subject || 'General'}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.duration || '1h'}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {session.date || 'TBD'} at {session.time || '--'}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.location || 'Online'}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {(session.skills || []).map(skill => (
                                                        <span key={skill} className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                    <MessageSquare className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                    <Bookmark className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.rating || '5.0'}</span>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{session.enrolled || 0}/{session.capacity || 0} enrolled</span>
                                                    <span className="font-bold text-green-600 dark:text-green-400">{session.price || 'Free'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <Calendar className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No sessions found</h3>
                                <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                    We couldn't find any sessions matching your filters. Try adjusting your search or browse all sessions.
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
        </div>
    );
};

export default SessionsPage;