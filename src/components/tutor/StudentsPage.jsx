// src/components/tutor/StudentsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, MessageSquare, Star, Calendar,
  ChevronLeft, ChevronRight, Eye, Plus, UserPlus, AlertCircle, BookOpen, UserCheck
} from 'lucide-react';
import api from '../../services/api';

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'by-session'
  const [stats, setStats] = useState({
    total: 0,
    beginner: 0,
    intermediate: 0,
    advanced: 0
  });
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentRes = await api.get('/v1/tutor/students');
        const studentData = Array.isArray(studentRes) ? studentRes : (studentRes?.data && Array.isArray(studentRes.data) ? studentRes.data : []);
        setStudents(studentData);
        
        // Fetch sessions
        const sessionsRes = await api.get('/v1/tutor/sessions');
        const sessionsData = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes?.data && Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
        setSessions(sessionsData);
        
        // Calculate stats from data
        setStats({
          total: studentData.length,
          beginner: studentData.filter(s => s.level?.toLowerCase() === 'beginner').length,
          intermediate: studentData.filter(s => s.level?.toLowerCase() === 'intermediate').length,
          advanced: studentData.filter(s => s.level?.toLowerCase() === 'advanced').length
        });
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || student.level?.toLowerCase() === filterLevel.toLowerCase();
    
    // Filter by session if in session view mode
    let matchesSession = true;
    if (viewMode === 'by-session' && selectedSession !== 'all') {
      const session = sessions.find(s => s._id === selectedSession || s.id === selectedSession);
      if (session) {
        const studentIds = session.studentIds || [];
        matchesSession = studentIds.some(id => 
          (typeof id === 'string' ? id : id._id) === (student._id || student.id)
        );
      }
    }
    
    return matchesSearch && matchesLevel && matchesSession;
  });

  // Get the selected session info
  const currentSessionData = sessions.find(s => s._id === selectedSession || s.id === selectedSession);
  const sessionStudentCount = currentSessionData?.studentIds?.length || 0;

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Students</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {viewMode === 'by-session' && selectedSession !== 'all'
              ? `Students in ${currentSessionData?.title || 'Session'}`
              : 'Manage your students and track their progress.'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <UserPlus className="w-5 h-5" />
            Add Student
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-medium transition-all">
            <MessageSquare className="w-5 h-5" />
            Bulk Message
          </button>
        </div>
      </div>

      {/* View Mode Toggle & Session Selector */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            All Students ({students.length})
          </button>
          <button
            onClick={() => setViewMode('by-session')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'by-session'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            By Session
          </button>
        </div>

        {viewMode === 'by-session' && (
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg border text-sm flex-1 sm:flex-initial"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Sessions</option>
            {sessions.map(session => (
              <option key={session._id || session.id} value={session._id || session.id}>
                {session.title} ({session.studentIds?.length || 0} students)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Session Info Panel */}
          {viewMode === 'by-session' && selectedSession !== 'all' && currentSessionData && (
            <div className="p-4 rounded-xl border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {currentSessionData.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {currentSessionData.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(currentSessionData.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {sessionStudentCount} / {currentSessionData.maxParticipants} students
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                    {sessionStudentCount}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Enrolled</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search students by name or email..."
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
              {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {currentStudents.length > 0 ? (
              currentStudents.map(student => (
                <div
                  key={student.id}
                  className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=random`}
                        alt={student.name}
                        className="w-16 h-16 rounded-full border-2 object-cover"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      <div>
                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{student.name}</h4>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{student.email}</p>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(student.level)}`}>
                            {student.level}
                          </span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {student.rating || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {student.lastSession || 'Never'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{student.sessions || 0} Sessions</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total booked</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No students found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
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
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Student Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Total Students</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>All active students</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.beginner}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Beginner</div>
                </div>
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.intermediate}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Intermediate</div>
                </div>
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.advanced}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Advanced</div>
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
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            <div className="space-y-3">
              {students.length > 0 ? (
                students.slice(0, 4).map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=random`}
                        alt={student.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Booked session</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{student.lastSession || 'Never'}</div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{student.sessions || 0} sessions</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm py-4" style={{ color: 'var(--text-secondary)' }}>No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;