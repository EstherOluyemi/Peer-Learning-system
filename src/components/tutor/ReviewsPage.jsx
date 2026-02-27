// src/components/tutor/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Star, Users, Calendar, TrendingUp, Search,
  ChevronLeft, ChevronRight, Eye, ThumbsUp, MessageCircle, AlertCircle, X, Send
} from 'lucide-react';
import api from '../../services/api';

/* ─── helpers ─────────────────────────────────────────────────────── */
/**
 * The API may return reviews in several shapes:
 *  - { _id, rating, comment, student: { name, avatar }, session: { title }, createdAt, responses }
 *  - { id, rating, comment, student: { name }, date, session }
 * We normalise to a flat, predictable shape.
 */
const normalizeReview = (r) => ({
  id: r._id || r.id,
  rating: r.rating || 0,
  comment: r.comment || r.text || '',
  date: r.createdAt || r.date || null,
  // student info
  studentName: r.student?.name || r.studentName || 'Student',
  studentAvatar: r.student?.avatar || r.studentAvatar || null,
  studentLevel: r.student?.level || r.studentLevel || 'Student',
  // session info
  sessionTitle: r.session?.title || r.sessionTitle || r.session || '',
  // responses
  responses: r.responses || [],
  helpful: r.helpful || 0,
});

const StarRow = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
      />
    ))}
  </div>
);

const Avatar = ({ name, avatar, size = 'w-12 h-12' }) => (
  <img
    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`}
    alt={name}
    className={`${size} rounded-full border-2 object-cover shrink-0`}
    style={{ borderColor: 'var(--border-color)' }}
  />
);

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

/* ─── component ───────────────────────────────────────────────────── */
const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    average: '0.0', total: 0, responseRate: '0%',
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Detail modal
  const [detailReview, setDetailReview] = useState(null);
  // Respond modal
  const [respondTarget, setRespondTarget] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const raw = await api.get('/v1/tutor/reviews');
        // api interceptor already strips response.data, so raw == body
        // body may be array OR { data: [...], ... } OR { reviews: [...] }
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.reviews)
              ? raw.reviews
              : [];

        const reviewData = list.map(normalizeReview);
        setReviews(reviewData);

        // Stats
        const total = reviewData.length;
        const sum = reviewData.reduce((a, r) => a + r.rating, 0);
        const average = total > 0 ? (sum / total).toFixed(1) : '0.0';
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewData.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[Math.floor(r.rating)]++; });
        const responded = reviewData.filter(r => r.responses.length > 0).length;
        const responseRate = total > 0 ? Math.round((responded / total) * 100) + '%' : '0%';

        setStats({ average, total, responseRate, distribution: dist });
      } catch (err) {
        setError('Failed to fetch reviews. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  /* ── respond to review ── */
  const handleResponse = async () => {
    if (!respondTarget || !responseText.trim()) return;
    setSubmittingResponse(true);
    try {
      await api.post(`/v1/tutor/reviews/${respondTarget.id}/response`, { text: responseText });
      const newResponse = {
        id: Date.now(),
        text: responseText,
        date: formatDate(new Date())
      };
      setReviews(prev => prev.map(r =>
        r.id === respondTarget.id
          ? { ...r, responses: [...r.responses, newResponse] }
          : r
      ));
      setRespondTarget(null);
      setResponseText('');
    } catch (err) {
      console.error('Failed to send response:', err);
    } finally {
      setSubmittingResponse(false);
    }
  };

  /* ── filtering / pagination ── */
  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || Math.floor(review.rating) === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline">Retry</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reviews</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and respond to student feedback.</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-bg)' }}>
          <Star className="w-6 h-6 text-yellow-500" />
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.average}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Filter by Rating</h3>
              <div className="space-y-1">
                {['all', '5', '4', '3', '2', '1'].map(r => (
                  <button
                    key={r}
                    onClick={() => { setFilterRating(r); setCurrentPage(1); }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${filterRating === r
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      {r !== 'all' && <Star className="w-4 h-4" />}
                      {r === 'all' ? 'All Reviews' : `${r} Star`}
                    </span>
                    {r !== 'all' && (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {stats.distribution[parseInt(r)]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Reviews</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>5 Star</span>
                  <span className="font-bold text-yellow-600">{stats.distribution[5]}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>4 Star</span>
                  <span className="font-bold text-green-600">{stats.distribution[4]}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
                  <span className="font-bold text-blue-600">{stats.responseRate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Reviews', value: stats.total, icon: <Star className="w-8 h-8 text-yellow-500" /> },
              { label: 'Average Rating', value: stats.average, icon: <TrendingUp className="w-8 h-8 text-green-500" /> },
              { label: 'Response Rate', value: stats.responseRate, icon: <Users className="w-8 h-8 text-blue-500" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                  </div>
                  {icon}
                </div>
              </div>
            ))}
          </div>

          {/* Review cards */}
          <div className="space-y-4">
            {currentReviews.length > 0 ? currentReviews.map(review => (
              <div
                key={review.id}
                className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left — student info + review */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar name={review.studentName} avatar={review.studentAvatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{review.studentName}</h4>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {review.studentLevel}
                        </span>
                        <StarRow rating={review.rating} />
                      </div>
                      {review.sessionTitle && (
                        <p className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                          <Calendar className="w-3 h-3" /> {review.sessionTitle}
                        </p>
                      )}
                      <p className="text-sm my-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {review.comment || <span className="italic opacity-60">No comment left</span>}
                      </p>
                      {review.date && (
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(review.date)}</p>
                      )}
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-green-600 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-sm">
                        <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpful})
                      </button>
                      <button
                        onClick={() => setDetailReview(review)}
                        title="View full review"
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border rounded-lg border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>
                      Responses: {review.responses.length}
                    </div>
                  </div>
                </div>

                {/* Existing responses */}
                {review.responses.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your Response</span>
                    </div>
                    {review.responses.map(resp => (
                      <div key={resp.id} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {resp.text}
                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>— {formatDate(resp.date) || resp.date}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Respond CTA */}
                {review.responses.length === 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => { setRespondTarget(review); setResponseText(''); }}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Respond to this review
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No reviews found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Page {currentPage} of {totalPages}</div>
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
      </div>

      {/* ══ Detail Modal ══ */}
      {detailReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailReview(null)}>
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <Avatar name={detailReview.studentName} avatar={detailReview.studentAvatar} size="w-10 h-10" />
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{detailReview.studentName}</h3>
                  <StarRow rating={detailReview.rating} />
                </div>
              </div>
              <button onClick={() => setDetailReview(null)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {detailReview.sessionTitle && (
                <div>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Session</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{detailReview.sessionTitle}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Review</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {detailReview.comment || <span className="italic opacity-60">No comment left</span>}
                </p>
              </div>
              {detailReview.date && (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(detailReview.date)}</p>
              )}
              {/* Responses */}
              {detailReview.responses.length > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500" /> Your Response
                  </p>
                  {detailReview.responses.map(resp => (
                    <div key={resp.id} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {resp.text}
                      <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>— {formatDate(resp.date) || resp.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button onClick={() => setDetailReview(null)} className="px-4 py-2 rounded-lg border font-medium transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                Close
              </button>
              {detailReview.responses.length === 0 && (
                <button
                  onClick={() => { setRespondTarget(detailReview); setDetailReview(null); setResponseText(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Respond
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ Respond Modal ══ */}
      {respondTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setRespondTarget(null); setResponseText(''); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Respond to Review</h2>
              <button onClick={() => { setRespondTarget(null); setResponseText(''); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Review preview */}
            <div className="mb-5 p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={respondTarget.studentName} avatar={respondTarget.studentAvatar} size="w-9 h-9" />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{respondTarget.studentName}</p>
                  <StarRow rating={respondTarget.rating} size="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{respondTarget.comment}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your Response</label>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Write a thoughtful response to this review..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                rows="5"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              />
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{responseText.length}/500 characters</div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRespondTarget(null); setResponseText(''); }}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                disabled={submittingResponse}
              >
                Cancel
              </button>
              <button
                onClick={handleResponse}
                disabled={!responseText.trim() || submittingResponse}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingResponse
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  : <><Send className="w-4 h-4" /> Send Response</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;