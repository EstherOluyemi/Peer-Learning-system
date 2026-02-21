// src/components/tutor/MaterialsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, BookOpen, AlertCircle, Search, Upload, X, FileText, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [uploadingSession, setUploadingSession] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLink, setUploadLink] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleFileSelect = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!uploadFile && !uploadLink.trim()) {
      alert('Please select a file or enter a link');
      return;
    }

    if (uploadFile && uploadFile.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      if (uploadFile) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result;
          formData.append('fileData', base64Data);
          formData.append('fileName', uploadFile.name);
          formData.append('fileSize', uploadFile.size);
          formData.append('type', 'file');
          if (uploadDescription) formData.append('description', uploadDescription);

          try {
            await api.post(
              `/v1/tutor/sessions/${uploadingSession}/materials`,
              formData,
              { headers: { 'Content-Type': 'application/json' } }
            );
            // Refresh sessions
            const response = await api.get('/v1/tutor/sessions');
            setSessions(response.data || []);
            setUploadFile(null);
            setUploadLink('');
            setUploadDescription('');
            setUploadingSession(null);
          } catch (err) {
            alert('Failed to upload file: ' + (err.message || 'Unknown error'));
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(uploadFile);
      } else {
        // Upload link
        formData.append('url', uploadLink);
        formData.append('type', 'link');
        if (uploadDescription) formData.append('description', uploadDescription);

        try {
          await api.post(
            `/v1/tutor/sessions/${uploadingSession}/materials`,
            formData
          );
          // Refresh sessions
          const response = await api.get('/v1/tutor/sessions');
          setSessions(response.data || []);
          setUploadFile(null);
          setUploadLink('');
          setUploadDescription('');
          setUploadingSession(null);
        } catch (err) {
          alert('Failed to add link: ' + (err.message || 'Unknown error'));
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (sessionId, materialId) => {
    if (!window.confirm('Delete this material?')) return;

    try {
      await api.delete(`/v1/tutor/sessions/${sessionId}/materials/${materialId}`);
      // Refresh sessions
      const response = await api.get('/v1/tutor/sessions');
      setSessions(response.data || []);
    } catch (err) {
      alert('Failed to delete material: ' + (err.message || 'Unknown error'));
    }
  };

  const currentSession = sessions.find((s) => s._id === expandedSession || s.id === expandedSession);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-700 dark:text-amber-400 mb-4">
        <div className="text-xl">⏱️</div>
        <div>
          <p className="font-semibold text-sm">Coming Soon</p>
          <p className="text-xs mt-1">Materials upload feature is in development. We'll come back to this after implementing other core features.</p>
        </div>
      </div>

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
              <div key={session._id || session.id}>
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition" onClick={() => setExpandedSession(expandedSession === (session._id || session.id) ? null : (session._id || session.id))}>
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
                        {session.materials && session.materials.length > 0
                          ? `${session.materials.length} material${session.materials.length !== 1 ? 's' : ''} uploaded`
                          : 'No materials uploaded yet'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadingSession(session._id || session.id);
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Add Material
                  </button>
                </div>

                {expandedSession === (session._id || session.id) && session.materials && session.materials.length > 0 && (
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
                              {material.fileName || material.url}
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
                          onClick={() => handleDeleteMaterial(session._id || session.id, material._id || idx)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Upload Modal */}
      {uploadingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Add Material to {currentSession?.title}
              </h2>
              <button
                onClick={() => {
                  setUploadingSession(null);
                  setUploadFile(null);
                  setUploadLink('');
                  setUploadDescription('');
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Upload File
                </h3>
                <label className="block p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {uploadFile ? uploadFile.name : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      Max 50MB
                    </p>
                  </div>
                  <input type="file" onChange={handleFileSelect} className="hidden" disabled={uploading} />
                </label>
              </div>

              {/* Or divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>OR</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
              </div>

              {/* Link Input */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Add Link
                </h3>
                <input
                  type="url"
                  placeholder="https://example.com/resource"
                  value={uploadLink}
                  onChange={(e) => setUploadLink(e.target.value)}
                  disabled={uploading || !!uploadFile}
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description (Optional)
                </h3>
                <textarea
                  placeholder="e.g., Chapter 5 lecture notes"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-2 rounded-lg border text-sm resize-none"
                  rows="3"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setUploadingSession(null);
                    setUploadFile(null);
                    setUploadLink('');
                    setUploadDescription('');
                  }}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || (!uploadFile && !uploadLink.trim())}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 ${
                    uploading || (!uploadFile && !uploadLink.trim())
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Add Material
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
