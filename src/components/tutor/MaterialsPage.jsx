// src/components/tutor/MaterialsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, BookOpen, AlertCircle, Search, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/sessions');
        setSessions(response.data || []);
      } catch (err) {
        setError('Failed to load sessions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    return sessions.filter((session) => {
      const haystack = [session.title, session.subject, session.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchQuery);
    });
  }, [sessions, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Materials</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Organize and share resources for each session.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Search className="w-4 h-4" />
          Search uses the header bar
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Materials by Session</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Loading sessions...</p>
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session._id || session.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {session.title || 'Untitled Session'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>{session.subject || 'General'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(session.startTime)}
                      </span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                      No materials uploaded yet.
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
                  disabled
                  aria-disabled="true"
                >
                  <Upload className="w-4 h-4" />
                  Upload (coming soon)
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {searchQuery ? 'No sessions found' : 'No sessions yet'}
              </h3>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery
                  ? "Try a different search term."
                  : "Create a session first to attach materials."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
