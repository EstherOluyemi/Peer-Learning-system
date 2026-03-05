// src/components/tutor/StudentsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, Search, MessageSquare, Calendar,
  ChevronLeft, ChevronRight, Eye, UserPlus, AlertCircle,
  BookOpen, Clock, CheckCircle, X, Video, Loader2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { updateSession } from '../../services/sessionService';

/* ─── helpers ─────────────────────────────────────────────────────── */
const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value._id || value.id || value.userId || null;
  return value;
};

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
};

const formatTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'ongoing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'scheduled':
    case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
};

const Avatar = ({ name, avatar, size = 'w-14 h-14' }) => (
  <img
    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=random&size=80`}
    alt={name || 'Student'}
    className={`${size} rounded-full border-2 object-cover shrink-0`}
    style={{ borderColor: 'var(--border-color)' }}
  />
);

/* ─── component ───────────────────────────────────────────────────── */
const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all'); // sessionId or 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [completingSession, setCompletingSession] = useState(null); // sessionId being completed
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addStudentQuery, setAddStudentQuery] = useState('');
  const [candidateStudents, setCandidateStudents] = useState([]);
  const [searchingCandidates, setSearchingCandidates] = useState(false);
  const [addStudentError, setAddStudentError] = useState(null);
  const [addingStudentId, setAddingStudentId] = useState(null);
  const [addStudentSuccess, setAddStudentSuccess] = useState(null);
  const [tutorSessions, setTutorSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [removingStudentSession, setRemovingStudentSession] = useState(null); // "studentId-sessionId"
  const navigate = useNavigate();
  const itemsPerPage = 8;

  // Derived unique sessions list from all student sessions for the filter dropdown
  const [allSessions, setAllSessions] = useState([]);

  const buildAllSessions = (studentList) => {
    const sessMap = {};
    studentList.forEach(student =>
      (student.sessions || []).forEach(s => {
        if (s.sessionId && !sessMap[s.sessionId]) sessMap[s.sessionId] = s;
      })
    );
    return Object.values(sessMap);
  };

  const normalizeStudentRecord = (value) => {
    if (!value || typeof value !== 'object') return null;
    const id = value._id || value.id || value.userId || value.learnerId;
    if (!id) return null;
    return {
      ...value,
      _id: id,
      name: value.name || value.fullName || 'Student',
      email: value.email || value.username || '',
      avatar: value.avatar || value.profileImage || value.photoUrl || null,
      isAdded: Boolean(value.isAdded),
      isInTutorList: Boolean(value.isInTutorList),
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
      upcomingSessions: value.upcomingSessions || 0,
      completedSessions: value.completedSessions || 0,
      totalSessions: value.totalSessions || 0,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const raw = await api.get('/v1/tutor/students');
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
            : [];

        // ── Auto-complete sessions whose endTime has already passed ──
        const now = new Date();
        const stale = [];
        list.forEach(student =>
          (student.sessions || []).forEach(s => {
            const status = (s.status || '').toLowerCase();
            if (status !== 'completed' && status !== 'cancelled' && s.endTime && new Date(s.endTime) < now) {
              if (!stale.find(x => x.sessionId === s.sessionId)) stale.push(s);
            }
          })
        );

        // Fire PATCH requests silently (don't block UI)
        if (stale.length > 0) {
          const patchedIds = new Set();
          await Promise.allSettled(
            stale.map(s =>
              updateSession(s.sessionId, { status: 'completed' })
                .then(() => patchedIds.add(s.sessionId))
                .catch(err => console.warn(`Auto-complete failed for session ${s.sessionId}:`, err))
            )
          );
          // Apply successful patches to local state
          if (patchedIds.size > 0) {
            const applyPatch = (studentList) =>
              studentList.map(student => {
                const nowCompleted = (student.sessions || []).filter(
                  s => patchedIds.has(s.sessionId) && s.status !== 'completed'
                ).length;
                return {
                  ...student,
                  sessions: (student.sessions || []).map(s =>
                    patchedIds.has(s.sessionId) ? { ...s, status: 'completed' } : s
                  ),
                  completedSessions: (student.completedSessions || 0) + nowCompleted,
                  upcomingSessions: Math.max(0, (student.upcomingSessions || 0) - nowCompleted),
                };
              });
            const patchedList = applyPatch(list);
            setStudents(patchedList);
            setAllSessions(buildAllSessions(patchedList));
          } else {
            setStudents(list);
            setAllSessions(buildAllSessions(list));
          }
        } else {
          setStudents(list);
          setAllSessions(buildAllSessions(list));
        }
      } catch (err) {
        setError('Failed to fetch students. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTutorSessions = async () => {
      try {
        const raw = await api.get('/v1/tutor/sessions');
        const payload = raw?.data || raw;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        setTutorSessions(list);
      } catch (err) {
        console.error('Failed to fetch tutor sessions for student assignment:', err);
      }
    };
    fetchTutorSessions();
  }, []);

  /* ── filtering ── */
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesSession = sessionFilter === 'all'
      || (student.sessions || []).some(s => s.sessionId === sessionFilter);
    return matchesSearch && matchesSession;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ── aggregate stats ── */
  const totalUpcoming = students.reduce((a, s) => a + (s.upcomingSessions || 0), 0);
  const totalCompleted = students.reduce((a, s) => a + (s.completedSessions || 0), 0);
  const totalEnrolments = students.reduce((a, s) => a + (s.totalSessions || 0), 0);

  /* ── most recent session label per student ── */
  const getLatestSession = (student) => {
    const sessions = student.sessions || [];
    if (!sessions.length) return null;
    return sessions.slice().sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
  };

  /* ── mark session as completed ── */
  const handleCompleteSession = async (sessionId) => {
    if (completingSession === sessionId) return;
    setCompletingSession(sessionId);
    try {
      await updateSession(sessionId, { status: 'completed' });
      const patchStudent = (student) => {
        const wasNotCompleted = (student.sessions || []).some(
          s => s.sessionId === sessionId && s.status !== 'completed'
        );
        return {
          ...student,
          sessions: (student.sessions || []).map(s =>
            s.sessionId === sessionId ? { ...s, status: 'completed' } : s
          ),
          completedSessions: wasNotCompleted
            ? (student.completedSessions || 0) + 1
            : student.completedSessions,
          upcomingSessions: wasNotCompleted
            ? Math.max(0, (student.upcomingSessions || 0) - 1)
            : student.upcomingSessions,
        };
      };
      setStudents(prev => prev.map(patchStudent));
      setDetailStudent(prev => prev ? patchStudent(prev) : null);
    } catch (err) {
      console.error('Failed to mark session as completed:', err);
      alert('Could not mark session as completed. Please try again.');
    } finally {
      setCompletingSession(null);
    }
  };

  /* ── remove student from session ── */
  const handleRemoveStudentFromSession = async (studentId, sessionId) => {
    if (!studentId || !sessionId) return;
    const trackingId = `${studentId}-${sessionId}`;
    if (removingStudentSession === trackingId) return;

    setRemovingStudentSession(trackingId);

    try {
      // Try multiple endpoint variants (tutor and learner endpoints)
      const endpoints = [
        `/v1/tutor/sessions/${sessionId}/students/${studentId}`,
        `/v1/tutor/sessions/${sessionId}/students/remove`,
        `/v1/tutor/sessions/${sessionId}/unenroll/${studentId}`,
        `/v1/learner/sessions/${sessionId}/unenroll`,
      ];

      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          const response = await api.delete(endpoint);
          if (response?.status === 200 || response?.data?.success) {
            // Success: remove from local state
            const patchStudent = (student) => ({
              ...student,
              sessions: (student.sessions || []).filter(s => s.sessionId !== sessionId),
              totalSessions: Math.max(0, (student.totalSessions || 0) - 1),
              upcomingSessions: Math.max(0, (student.upcomingSessions || 0) - 1),
            });
            setStudents(prev => prev.map(patchStudent));
            setDetailStudent(prev => prev ? patchStudent(prev) : null);
            
            // Also update tutorSessions to remove this studentId
            setTutorSessions(prev =>
              prev.map(sess =>
                sess.sessionId === sessionId || (sess._id || sess.id) === sessionId
                  ? {
                      ...sess,
                      studentIds: (sess.studentIds || []).filter(id => normalizeId(id) !== studentId),
                    }
                  : sess
              )
            );
            return; // Exit on first success
          }
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || err?.status;
          // Continue to next endpoint on 404/405
          if (![404, 405].includes(status)) {
            throw err; // Re-throw on other errors
          }
        }
      }

      // If all endpoints failed, throw the last error
      if (lastError) throw lastError;
    } catch (err) {
      console.error('Failed to remove student from session:', err);
      alert('Could not remove student from session. Please try again.');
    } finally {
      setRemovingStudentSession(null);
    }
  };

  const searchCandidateStudents = async (query) => {
    if (!selectedSessionId) {
      setCandidateStudents([]);
      setSearchingCandidates(false);
      return;
    }

    const term = query.trim();

    setSearchingCandidates(true);
    setAddStudentError(null);

    try {
      const raw = await api.get('/v1/tutor/students/search', {
        params: {
          search: term,
          sessionId: selectedSessionId,
          page: 1,
          limit: 20,
        },
      });

      const payload = raw?.data || raw;
      const resultList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.students)
          ? payload.students
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      const selectedSession = tutorSessions.find((session) => (session._id || session.id) === selectedSessionId);
      const enrolledIds = new Set(((selectedSession?.studentIds || []).map(normalizeId)).filter(Boolean));
      const candidates = resultList
        .map(normalizeStudentRecord)
        .filter(Boolean)
        .map((student) => ({
          ...student,
          isAdded: typeof student.isAdded === 'boolean' ? student.isAdded : enrolledIds.has(student._id),
        }));

      setCandidateStudents(candidates);
      setAddStudentError(null);
    } catch (err) {
      console.error('Failed to fetch available students:', {
        status: err?.status,
        code: err?.code,
        message: err?.message,
        payload: err?.payload,
      });
      if (err?.status === 404) {
        if (err?.code === 'SESSION_NOT_FOUND' || err?.response?.data?.code === 'SESSION_NOT_FOUND') {
          setAddStudentError('Selected session was not found. Please refresh sessions and try again.');
          setCandidateStudents([]);
          return;
        }
        setAddStudentError('Student search endpoint is not available yet on backend.');
      } else {
        const errorMsg = err?.message || 'Unable to load students right now. Please try again.';
        setAddStudentError(errorMsg);
      }
      setCandidateStudents([]);
    } finally {
      setSearchingCandidates(false);
    }
  };

  useEffect(() => {
    if (!isAddStudentOpen) return;
    const timeoutId = setTimeout(() => {
      searchCandidateStudents(addStudentQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [addStudentQuery, isAddStudentOpen, selectedSessionId, tutorSessions]);

  const handleAddStudent = async (student) => {
    if (!student?._id || addingStudentId === student._id || student.isAdded || !selectedSessionId) return;

    setAddingStudentId(student._id);
    setAddStudentError(null);

    try {
      const endpoints = [
        `/v1/tutor/sessions/${selectedSessionId}/students/add`,
        `/v1/tutor/sessions/${selectedSessionId}/students`,
        `/v1/tutor/sessions/${selectedSessionId}/add-student`,
        `/v1/tutor/sessions/${selectedSessionId}/enrollments`
      ];

      let raw;
      let lastError;
      for (const endpoint of endpoints) {
        try {
          raw = await api.post(endpoint, { studentId: student._id });
          break;
        } catch (err) {
          lastError = err;
          const status = err?.status || err?.response?.status;
          if (status === 404 || status === 405) continue;
          throw err;
        }
      }

      if (!raw) {
        throw lastError || new Error('Session student assignment endpoint is not available.');
      }

      const candidate = normalizeStudentRecord(raw?.student || raw?.data?.student || raw?.data || raw);
      const selectedSession = tutorSessions.find((session) => (session._id || session.id) === selectedSessionId);
      const newSessionEntry = {
        sessionId: selectedSessionId,
        title: selectedSession?.title || 'Session',
        subject: selectedSession?.subject || '',
        startTime: selectedSession?.startTime,
        endTime: selectedSession?.endTime,
        status: selectedSession?.status || 'scheduled',
        meetingLink: selectedSession?.meetingLink,
      };
      const addedStudent = candidate || {
        ...student,
        sessions: [newSessionEntry],
        upcomingSessions: 1,
        completedSessions: 0,
        totalSessions: 1,
      };

      setStudents(prev => {
        const existing = prev.find(s => s._id === addedStudent._id);
        if (!existing) {
          const next = [addedStudent, ...prev];
          setAllSessions(buildAllSessions(next));
          return next;
        }

        const alreadyInSession = (existing.sessions || []).some(s => s.sessionId === selectedSessionId);
        if (alreadyInSession) return prev;

        const nextSessions = [...(existing.sessions || []), newSessionEntry];
        const completedSessions = nextSessions.filter((s) => (s.status || '').toLowerCase() === 'completed').length;
        const upcomingSessions = nextSessions.filter((s) => {
          const status = (s.status || '').toLowerCase();
          return status !== 'completed' && status !== 'cancelled';
        }).length;

        const next = prev.map((item) => item._id === existing._id
          ? {
            ...item,
            sessions: nextSessions,
            completedSessions,
            upcomingSessions,
            totalSessions: nextSessions.length,
          }
          : item);

        setAllSessions(buildAllSessions(next));
        return next;
      });
      setTutorSessions(prev => prev.map((session) => {
        const currentId = session._id || session.id;
        if (currentId !== selectedSessionId) return session;
        const studentIds = Array.isArray(session.studentIds) ? session.studentIds : [];
        if (studentIds.some((id) => normalizeId(id) === student._id)) return session;
        return { ...session, studentIds: [...studentIds, student._id] };
      }));
      setCandidateStudents(prev => prev.map(s =>
        s._id === addedStudent._id
          ? { ...s, isAdded: true }
          : s
      ));
      setAddStudentSuccess(`${addedStudent.name} added to ${selectedSession?.title || 'session'} successfully.`);
      setAddingStudentId(null);
    } catch (err) {
      console.error('Failed to add student:', err);
      if (err?.status === 404) {
        setAddStudentError('Student does not exist.');
      } else if (err?.status === 409) {
        setAddStudentError('Student is already added.');
      } else {
        setAddStudentError(err?.message || 'Could not add student. Please try again.');
      }
      setAddingStudentId(null);
    }
  };

  useEffect(() => {
    if (!addStudentSuccess) return undefined;
    const timeoutId = setTimeout(() => setAddStudentSuccess(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [addStudentSuccess]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
          <button onClick={() => window.location.reload()} className="ml-auto text-xs font-bold underline hover:no-underline">Retry</button>
        </div>
      )}

      {addStudentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{addStudentSuccess}</p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Students</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your students and track their progress.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setIsAddStudentOpen(true);
              setAddStudentQuery('');
              setCandidateStudents([]);
              setAddStudentError(null);
              setSelectedSessionId('');
              setSearchingCandidates(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" /> Add Student to Session
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
          />
        </div>
        {/* Session filter */}
        {allSessions.length > 0 && (
          <select
            value={sessionFilter}
            onChange={e => { setSessionFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Sessions</option>
            {allSessions.map(s => (
              <option key={s.sessionId} value={s.sessionId}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Main List ── */}
        <div className="lg:col-span-3 space-y-4">
          {currentStudents.length > 0 ? currentStudents.map(student => {
            const latest = getLatestSession(student);
            return (
              <div
                key={student._id}
                className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <Avatar name={student.name} avatar={student.avatar} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{student.name}</h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{student.email}</p>

                      {/* Session stats row */}
                      <div className="flex flex-wrap gap-3 text-xs font-medium mb-3">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Calendar className="w-3 h-3" /> {student.upcomingSessions || 0} upcoming
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> {student.completedSessions || 0} completed
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          <BookOpen className="w-3 h-3" /> {student.totalSessions || 0} total
                        </span>
                      </div>

                      {/* Most recent session preview */}
                      {latest && (
                        <div className="text-xs flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{latest.title}</span>
                          <span>·</span>
                          <span>{latest.subject}</span>
                          <span>·</span>
                          <span>{formatDate(latest.startTime)}</span>
                          <span className={`px-1.5 py-0.5 rounded-full font-semibold ${statusColor(latest.status)}`}>
                            {latest.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate('/dashboard-tutor/messages', { state: { openWithUserId: student._id } })}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                    <button
                      onClick={() => setDetailStudent(student)}
                      title="View student sessions"
                      className="p-2 border rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No students found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or session filter.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Overview */}
          <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Students</span>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{students.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Enrolments</span>
                <span className="font-bold text-blue-600">{totalEnrolments}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Upcoming</span>
                <span className="font-bold text-blue-600">{totalUpcoming}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
                <span className="font-bold text-emerald-600">{totalCompleted}</span>
              </div>
            </div>
          </div>

          {/* Recent students */}
          <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Students</h3>
            <div className="space-y-3">
              {students.slice(0, 5).map(student => (
                <div key={student._id} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <Avatar name={student.name} avatar={student.avatar} size="w-8 h-8" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{student.totalSessions || 0} session{student.totalSessions !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
              {!students.length && <p className="text-sm text-center py-2" style={{ color: 'var(--text-secondary)' }}>No students yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Student Detail Modal ══ */}
      {isAddStudentOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsAddStudentOpen(false);
            setAddStudentError(null);
            setAddingStudentId(null);
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Add Student to Session</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a session, then search and add a learner.</p>
              </div>
              <button
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setAddStudentError(null);
                  setAddingStudentId(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select Session
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => {
                    setSelectedSessionId(e.target.value);
                    setCandidateStudents([]);
                    setAddStudentError(null);
                  }}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                >
                  <option value="">Choose a session...</option>
                  {tutorSessions.map((session) => (
                    <option key={session._id || session.id} value={session._id || session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={addStudentQuery}
                  onChange={(e) => setAddStudentQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  disabled={!selectedSessionId}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                />
              </div>

              {addStudentError && (
                <div className="p-3 rounded-lg border text-sm bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                  {addStudentError}
                </div>
              )}

              <div className="max-h-72 overflow-y-auto border rounded-xl" style={{ borderColor: 'var(--card-border)' }}>
                {!selectedSessionId ? (
                  <p className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                    Select a session to search learners.
                  </p>
                ) : searchingCandidates ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                  </div>
                ) : candidateStudents.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                    {candidateStudents.map((student) => (
                      <div key={student._id} className="p-3 flex items-center gap-3">
                        <Avatar name={student.name} avatar={student.avatar} size="w-10 h-10" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{student.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{student.email || 'No email'}</p>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student)}
                          disabled={addingStudentId === student._id || student.isAdded}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                        >
                          {student.isAdded ? 'Added' : addingStudentId === student._id ? 'Adding…' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                    {addStudentQuery.trim() ? 'No students found for your search.' : 'No students found.'}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setAddStudentError(null);
                  setAddingStudentId(null);
                }}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDetailStudent(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <Avatar name={detailStudent.name} avatar={detailStudent.avatar} size="w-11 h-11" />
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{detailStudent.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{detailStudent.email}</p>
                </div>
              </div>
              <button onClick={() => setDetailStudent(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              {[
                { label: 'Total', value: detailStudent.totalSessions || 0, color: 'text-slate-700 dark:text-slate-300' },
                { label: 'Upcoming', value: detailStudent.upcomingSessions || 0, color: 'text-blue-600' },
                { label: 'Completed', value: detailStudent.completedSessions || 0, color: 'text-emerald-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 text-center" style={{ borderColor: 'var(--border-color)' }}>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Sessions list */}
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
              <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Enrolled Sessions ({(detailStudent.sessions || []).length})
              </h4>
              {(detailStudent.sessions || []).length > 0 ? (
                detailStudent.sessions.map(s => (
                  <div
                    key={s.sessionId}
                    className="p-4 rounded-xl border"
                    style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{s.subject}</p>
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(s.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(s.startTime)} – {formatTime(s.endTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.meetingLink && (
                          s.status === 'completed' ? (
                            <span
                              title="Session has ended"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                            >
                              <Video className="w-3.5 h-3.5" /> Join
                            </span>
                          ) : (
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" /> Join
                            </a>
                          )
                        )}
                        {/* Manual fallback: show only when endTime hasn't passed yet */}
                        {s.status !== 'completed' && s.status !== 'cancelled' &&
                          (!s.endTime || new Date(s.endTime) >= new Date()) && (
                            <button
                              onClick={() => handleCompleteSession(s.sessionId)}
                              disabled={completingSession === s.sessionId}
                              title="Mark session as completed"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {completingSession === s.sessionId ? 'Saving…' : 'Mark Complete'}
                            </button>
                          )}
                        <button
                          onClick={() => handleRemoveStudentFromSession(detailStudent._id, s.sessionId)}
                          disabled={removingStudentSession === `${detailStudent._id}-${s.sessionId}`}
                          title="Remove student from this session"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {removingStudentSession === `${detailStudent._id}-${s.sessionId}` ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No sessions enrolled</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;