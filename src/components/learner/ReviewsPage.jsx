// src/components/learner/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Star, Send, AlertCircle, Calendar,
  MessageSquare, Trash2, X
} from 'lucide-react';
import api from '../../services/api';
import { normalizeSessionList } from '../../services/sessionService';

/* ─── helpers ─────────────────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
      >
        <Star
          className={`w-8 h-8 ${star <= value ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
        />
      </button>
    ))}
  </div>
);

const ratingLabel = {
  1: 'Poor — I did not enjoy this session',
  2: 'Fair — Some issues with the session',
  3: 'Good — Overall satisfied',
  4: 'Very Good — Enjoyed the session',
  5: 'Excellent — Highly recommend!',
};

/* ─── component ───────────────────────────────────────────────────── */
const LearnerReviewsPage = () => {
  const [completedSessions, setCompletedSessions] = useState([]);
  // Map of sessionId -> { rating, comment } — ratings already submitted
  const [sessionRatings, setSessionRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // ── fetch sessions + existing ratings ──────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // api interceptor returns body directly (already unwraps response.data)
      // Body shape:  { status: "success", data: [ { session: {...}, enrollmentStatus } ] }
      const body = await api.get('/v1/learner/sessions');
      // normalizeSessionList handles both wrapped { session, enrollmentStatus } and flat shapes
      const rawList = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      const all = normalizeSessionList(rawList);
      const completed = all.filter(s => s.status === 'completed');
      setCompletedSessions(completed);

      // Fetch existing ratings for each completed session
      const ratingMap = {};
      await Promise.all(completed.map(async (s) => {
        const sid = s._id || s.id;
        try {
          const res = await api.get(`/v1/learner/sessions/${sid}/rate`);
          const ratingData = res?.data ?? res;
          if (ratingData && ratingData.rating) {
            ratingMap[sid] = ratingData;
          }
        } catch {
          // 404 → not rated yet, ignore
        }
      }));
      setSessionRatings(ratingMap);
    } catch (err) {
      setError('Failed to load sessions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── submit rating ───────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!selectedSession || !reviewForm.comment.trim()) {
      alert('Please add a comment to your review');
      return;
    }
    const sid = selectedSession._id || selectedSession.id;
    setSubmitting(true);
    try {
      await api.post(`/v1/learner/sessions/${sid}/rate`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setSessionRatings(prev => ({
        ...prev,
        [sid]: { rating: reviewForm.rating, comment: reviewForm.comment }
      }));
      setShowReviewForm(false);
      setSelectedSession(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to submit review'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── helpers ─────────────────────────────────────────────────────────
  const getTutorName = (session) =>
    session.tutor?.name || session.tutorName || session.tutorInfo?.name || 'Tutor';

  const hasRated = (session) => {
    const sid = session._id || session.id;
    return !!sessionRatings[sid];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
      </div>
    );
  }

  const ratedSessions = completedSessions.filter(s => hasRated(s));
  const unratedSessions = completedSessions.filter(s => !hasRated(s));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Reviews</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
          Share your feedback about tutors and help the community
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Leave a Review ── */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Leave a Review</h2>

        {completedSessions.length > 0 ? (
          <div className="space-y-3">
            {completedSessions.map(session => {
              const sid = session._id || session.id;
              const alreadyRated = hasRated(session);
              const rating = sessionRatings[sid];
              return (
                <div
                  key={sid}
                  className="p-4 rounded-lg border flex items-center justify-between gap-4"
                  style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {session.title || 'Untitled Session'}
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      with <span className="font-medium">{getTutorName(session)}</span>
                    </p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar className="w-3 h-3" /> {formatDate(session.startTime)}
                    </p>
                    {alreadyRated && rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rating.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedSession(session); setShowReviewForm(true); }}
                    disabled={alreadyRated}
                    className={`px-4 py-2 rounded-lg font-medium text-sm shrink-0 transition-colors ${alreadyRated
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {alreadyRated ? '✓ Reviewed' : 'Review'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p style={{ color: 'var(--text-secondary)' }}>No completed sessions to review yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Complete a tutoring session to leave a review</p>
          </div>
        )}
      </div>

      {/* ── My Submitted Reviews ── */}
      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            My Reviews ({ratedSessions.length})
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {ratedSessions.length > 0 ? (
            ratedSessions.map(session => {
              const sid = session._id || session.id;
              const rating = sessionRatings[sid];
              return (
                <div key={sid} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{session.title || 'Untitled Session'}</h3>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{getTutorName(session)}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rating.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                    <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>
                      {rating.rating}.0
                    </span>
                  </div>

                  {rating.comment && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rating.comment}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p style={{ color: 'var(--text-secondary)' }}>No reviews submitted yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Complete a session and share your feedback
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Review Form Modal ── */}
      {showReviewForm && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Review for {getTutorName(selectedSession)}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedSession.title}</p>
              </div>
              <button
                onClick={() => { setShowReviewForm(false); setSelectedSession(null); setReviewForm({ rating: 5, comment: '' }); }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Your Rating</label>
                <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{ratingLabel[reviewForm.rating]}</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Comment (Required)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{reviewForm.comment.length}/500 characters</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button
                onClick={() => { setShowReviewForm(false); setSelectedSession(null); setReviewForm({ rating: 5, comment: '' }); }}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewForm.comment.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${submitting || !reviewForm.comment.trim()
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerReviewsPage;
