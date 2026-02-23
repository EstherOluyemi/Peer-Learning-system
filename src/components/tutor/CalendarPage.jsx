// src/components/tutor/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight, 
  Plus, Eye, Edit, Trash2, AlertCircle, Video, Filter, X
} from 'lucide-react';
import api from '../../services/api';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/tutor/sessions');
      const allSessions = response.data || [];
      setSessions(allSessions);
    } catch (err) {
      setError('Failed to fetch sessions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      weekDates.push(day);
    }
    
    return weekDates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const dates = [];
    
    // Previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      dates.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingDays = 42 - dates.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return dates;
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      if (!session.startTime) return false;
      const sessionDate = new Date(session.startTime);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'scheduled': 'bg-blue-500',
      'ongoing': 'bg-green-500',
      'completed': 'bg-gray-400',
      'cancelled': 'bg-red-500'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-400';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '--:--';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Session Calendar</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            View and manage your scheduled tutoring sessions
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard-tutor/create-session')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Session
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

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center min-w-50">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            {viewMode === 'week' && (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Week of {getWeekDates(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            Today
          </button>
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              style={{ color: viewMode === 'week' ? 'white' : 'var(--text-secondary)' }}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              style={{ color: viewMode === 'month' ? 'white' : 'var(--text-secondary)' }}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {dayNames.map(day => (
            <div
              key={day}
              className="py-3 text-center text-sm font-bold"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7">
            {getWeekDates(currentDate).map((date, idx) => {
              const daySessions = getSessionsForDate(date);
              return (
                <div
                  key={idx}
                  className={`min-h-30 p-2 border-r border-b ${
                    isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday(date) ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                    style={{ color: isToday(date) ? undefined : 'var(--text-primary)' }}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySessions.map(session => (
                      <div
                        key={session._id || session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`p-2 rounded text-xs cursor-pointer transition-all hover:shadow-md ${
                          getStatusColor(session.status)
                        } text-white`}
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-90">{formatTime(session.startTime)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7">
            {getMonthDates(currentDate).map((dateObj, idx) => {
              const { date, isCurrentMonth } = dateObj;
              const daySessions = getSessionsForDate(date);
              return (
                <div
                  key={idx}
                  className={`min-h-25 p-2 border-r border-b ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                    style={{ color: isToday(date) ? undefined : 'var(--text-primary)' }}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map(session => (
                      <div
                        key={session._id || session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`px-1.5 py-1 rounded text-xs cursor-pointer transition-all hover:shadow-md ${
                          getStatusColor(session.status)
                        } text-white truncate`}
                      >
                        {session.title}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-xs px-1.5 py-1" style={{ color: 'var(--text-secondary)' }}>
                        +{daySessions.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {selectedSession.title}
                </h2>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedSession.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  selectedSession.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  selectedSession.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {selectedSession.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Start Time</div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatTime(selectedSession.startTime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Students</div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedSession.studentIds?.length || 0}/{selectedSession.maxParticipants || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedSession.description || 'No description provided'}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => {
                    navigate(`/dashboard-tutor/create-session?edit=${selectedSession._id || selectedSession.id}`, {
                      state: { sessionData: selectedSession }
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSession(selectedSession._id || selectedSession.id)}
                  disabled={deletingSessionId === selectedSession._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingSessionId === selectedSession._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
