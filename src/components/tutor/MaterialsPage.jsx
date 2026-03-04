// src/components/tutor/MaterialsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, AlertCircle, Upload, X, FileText, Trash2, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSessionId, setUploadSessionId] = useState('');
  const [uploading, setUploading] = useState(false);

  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [materialsRes, sessionsRes] = await Promise.all([
          api.get('/v1/tutor/materials', { params: { page: 1, limit: 100 } }),
          api.get('/v1/tutor/sessions')
        ]);
        setMaterials(materialsRes.data?.materials || []);
        setSessions(sessionsRes.data || []);
      } catch (err) {
        setError('Failed to load materials. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMaterials = useMemo(() => {
    let result = materials;

    if (selectedSessionFilter !== 'all') {
      result = result.filter(m => m.sessionId === selectedSessionFilter);
    }

    if (searchQuery) {
      result = result.filter((material) => {
        const haystack = [
          material.title,
          material.description,
          material.session?.title,
          material.session?.subject
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    return result;
  }, [materials, searchQuery, selectedSessionFilter]);

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
    const file = e.target.files[0];
    setUploadFile(file);
    if (file && !uploadTitle) {
      setUploadTitle(file.name);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    if (!uploadTitle.trim()) {
      alert('Please enter a title for this material');
      return;
    }

    if (uploadFile.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription.trim());
      }
      if (uploadSessionId) {
        formData.append('sessionId', uploadSessionId);
      }

      const response = await api.post('/v1/tutor/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newMaterial = response.data?.material || response.data;
      if (newMaterial) {
        setMaterials(prev => [newMaterial, ...prev]);
      }

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadSessionId('');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload material: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material? This action cannot be undone.')) return;

    try {
      await api.delete(`/v1/tutor/materials/${materialId}`);
      setMaterials(prev => prev.filter(m => (m._id || m.id) !== materialId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete material: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Materials</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Organize and share resources for your sessions.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Upload className="w-4 h-4" />
          Upload Material
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Filter by session:</label>
        <select
          value={selectedSessionFilter}
          onChange={(e) => setSelectedSessionFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Materials</option>
          {sessions.map(session => (
            <option key={session._id || session.id} value={session._id || session.id}>
              {session.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Your Materials ({filteredMaterials.length})
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Loading materials...</p>
            </div>
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => {
              const materialId = material._id || material.id;
              
              return (
                <div key={materialId} className="p-6 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {material.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        {material.session && (
                          <>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {material.session.title}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          </>
                        )}
                        {material.size && <span>{formatFileSize(material.size)}</span>}
                        {material.mimeType && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>{material.mimeType.split('/')[1]?.toUpperCase()}</span>
                          </>
                        )}
                        {material.createdAt && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>
                              {new Date(material.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition"
                        title="Download/View"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteMaterial(materialId)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {searchQuery || selectedSessionFilter !== 'all' ? 'No materials found' : 'No materials yet'}
              </h3>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || selectedSessionFilter !== 'all'
                  ? "Try adjusting your filters."
                  : "Upload your first material to get started."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Upload Material
              </h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadDescription('');
                  setUploadSessionId('');
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  File <span className="text-red-500">*</span>
                </h3>
                <label className="block p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {uploadFile ? uploadFile.name : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      Max 25MB • PDF, Images, Word, PowerPoint, Excel, Text
                    </p>
                  </div>
                  <input type="file" onChange={handleFileSelect} className="hidden" disabled={uploading} />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Title <span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  placeholder="e.g., Chapter 5 Notes"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description (Optional)
                </h3>
                <textarea
                  placeholder="Add context about this material..."
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

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Link to Session (Optional)
                </h3>
                <select
                  value={uploadSessionId}
                  onChange={(e) => setUploadSessionId(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">None - General Material</option>
                  {sessions.map(session => (
                    <option key={session._id || session.id} value={session._id || session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadTitle('');
                    setUploadDescription('');
                    setUploadSessionId('');
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
                  disabled={uploading || !uploadFile || !uploadTitle.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 ${
                    uploading || !uploadFile || !uploadTitle.trim()
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
                      Upload Material
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
