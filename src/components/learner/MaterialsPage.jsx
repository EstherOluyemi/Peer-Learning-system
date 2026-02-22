// src/components/learner/MaterialsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, BookOpen, AlertCircle, Search, FileText, Link as LinkIcon, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const LearnerMaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);

  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/learner/sessions');
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
    const withMaterials = sessions.filter((session) => session.materials && session.materials.length > 0);
    if (!searchQuery) return withMaterials;
    return withMaterials.filter((session) => {
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownload = (material) => {
    if (material.type === 'link') {
      window.open(material.url, '_blank');
    } else if (material.fileData) {
      // Download base64-encoded file
      const link = document.createElement('a');
      link.href = material.fileData;
      link.download = material.fileName || 'material';
      link.click();
    }
  };

  const getTutorName = (tutorInfo) => {
    if (typeof tutorInfo === 'string') return tutorInfo;
    if (tutorInfo?.name) return tutorInfo.name;
    if (tutorInfo?.firstName) return `${tutorInfo.firstName} ${tutorInfo.lastName || ''}`.trim();
    return 'Tutor';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Course Materials</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Access learning resources from your sessions.
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
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Materials by Session</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Loading materials...</p>
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session._id || session.id}>
                <div
                  className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  onClick={() => setExpandedSession(expandedSession === (session._id || session.id) ? null : (session._id || session.id))}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
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
                        by {getTutorName(session.tutorInfo || session.tutorId)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600" style={{ color: 'var(--accent)' }}>
                      {session.materials.length}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      material{session.materials.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {expandedSession === (session._id || session.id) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 space-y-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    {session.materials.map((material, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border flex items-start justify-between gap-4"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex-1 flex items-start gap-3">
                          <div className="p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {material.type === 'file' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {material.fileName || 'External Link'}
                            </h4>
                            {material.description && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {material.description}
                              </p>
                            )}
                            <div className="flex gap-3 text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                              {material.fileSize && <span>{formatFileSize(material.fileSize)}</span>}
                              {material.uploadedAt && (
                                <span>
                                  {new Date(material.uploadedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition shrink-0"
                          title={material.type === 'link' ? 'Open link' : 'Download file'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {searchQuery ? 'No materials found' : 'No materials available'}
              </h3>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery
                  ? "Try a different search term."
                  : "Your tutors haven't uploaded any materials yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerMaterialsPage;
