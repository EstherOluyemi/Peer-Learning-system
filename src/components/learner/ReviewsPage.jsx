// src/components/learner/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Star, Send, AlertCircle, Calendar, User, Trash2, X,
  MessageSquare, ThumbsUp, ChevronRight
} from 'lucide-react';
import api from '../../services/api';

const LearnerReviewsPage = () => {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch learner's sessions
      const sessionsRes = await api.get('/v1/learner/sessions');
      const sessions = sessionsRes.data || [];
      
      // Filter completed sessions
      const completed = sessions.filter(s => s.status === 'completed');
      setCompletedSessions(completed);

      // Fetch reviews the learner has left
      try {
        const reviewsRes = await api.get('/v1/learner/reviews');
        setMyReviews(reviewsRes.data || []);
      } catch (err) {
        console.warn('Could not fetch reviews:', err);
        setMyReviews([]);
      }
    } catch (err) {
      setError('Failed to load reviews data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedSession || !reviewForm.comment.trim()) {
      alert('Please add a comment to your review');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/v1/learner/sessions/${selectedSession._id}/review`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        tutorId: selectedSession.tutorInfo?._id || selectedSession.tutorId
      });

      // Refresh reviews
      await fetchData();
      setShowReviewForm(false);
      setSelectedSession(null);
      setReviewForm({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to submit review'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    
    setDeletingId(reviewId);
    try {
      await api.delete(`/v1/learner/reviews/${reviewId}`);
      setMyReviews(myReviews.filter(r => r._id !== reviewId));
      alert('Review deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to delete review'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getSessionTutorName = (session) => {
    if (session.tutorInfo?.name) return session.tutorInfo.name;
    if (session.tutorId?.name) return session.tutorId.name;
    return 'Unknown Tutor';
  };

  const hasReviewedSession = (sessionId) => {
    return myReviews.some(r => r.sessionId === sessionId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
      </div>
    );
  }

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

      {/* Leave a Review Section */}
      <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Leave a Review</h2>
        
        {completedSessions.length > 0 ? (
          <div className="space-y-4">
            {completedSessions.map((session) => {
              const alreadyReviewed = hasReviewedSession(session._id);
              return (
                <div 
                  key={session._id}
                  className="p-4 rounded-lg border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {session.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      with <span className="font-medium">{getSessionTutorName(session)}</span>
                    </p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.startTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowReviewForm(true);
                    }}
                    disabled={alreadyReviewed}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      alreadyReviewed
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {alreadyReviewed ? '✓ Reviewed' : 'Review'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p style={{ color: 'var(--text-secondary)' }}>No completed sessions to review yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Complete a tutoring session to leave a review
            </p>
          </div>
        )}
      </div>

      {/* My Reviews Section */}
      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            My Reviews ({myReviews.length})
          </h2>
        </div>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {myReviews.length > 0 ? (
            myReviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {review.sessionTitle || 'Session Review'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {review.tutorName || 'Tutor'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={deletingId === review._id}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition"
                    title="Delete review"
                  >
                    <Trash2 className={`w-4 h-4 ${deletingId === review._id ? 'opacity-50' : ''}`} />
                  </button>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>
                    {review.rating}.0
                  </span>
                </div>

                {/* Comment */}
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {review.comment}
                </p>

                {/* Date */}
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(review.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Complete a session and share your feedback
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedSession && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Review for {getSessionTutorName(selectedSession)}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedSession.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedSession(null);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {reviewForm.rating === 1 && 'Poor - I did not enjoy this session'}
                  {reviewForm.rating === 2 && 'Fair - Some issues with the session'}
                  {reviewForm.rating === 3 && 'Good - Overall satisfied'}
                  {reviewForm.rating === 4 && 'Very Good - Enjoyed the session'}
                  {reviewForm.rating === 5 && 'Excellent - Highly recommend!'}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Your Comment (Required)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {reviewForm.comment.length}/500 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedSession(null);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewForm.comment.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  submitting || !reviewForm.comment.trim()
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
