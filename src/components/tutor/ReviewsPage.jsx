// src/components/tutor/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Star, Users, Calendar, TrendingUp, Filter, Search,
  ChevronLeft, ChevronRight, Eye, ThumbsUp, ThumbsDown, MessageCircle, AlertCircle, X, Send
} from 'lucide-react';
import api from '../../services/api';

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [stats, setStats] = useState({
    average: '0.0',
    total: 0,
    responseRate: '0%',
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/reviews');
        const reviewData = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
        setReviews(reviewData);

        // Calculate stats
        const total = reviewData.length;
        const sum = reviewData.reduce((acc, r) => acc + (r.rating || 0), 0);
        const average = total > 0 ? (sum / total).toFixed(1) : '0.0';
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewData.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) distribution[Math.floor(r.rating)]++;
        });

        const responded = reviewData.filter(r => r.responses && r.responses.length > 0).length;
        const responseRate = total > 0 ? Math.round((responded / total) * 100) + '%' : '0%';

        setStats({
          average,
          total,
          responseRate,
          distribution
        });
      } catch (err) {
        setError('Failed to fetch reviews. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = (review.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.session || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || Math.floor(review.rating) === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResponse = async (reviewId, text) => {
    if (!text.trim()) return;
    
    try {
      setSubmittingResponse(true);
      
      // Optimistic update
      const updatedReviews = reviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            responses: [...(r.responses || []), {
              id: Date.now(),
              text: text,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }]
          };
        }
        return r;
      });
      setReviews(updatedReviews);
      
      // Reset modal
      setShowResponseModal(false);
      setResponseText('');
      setSelectedReviewId(null);

      // Real API call
      await api.post(`/v1/tutor/reviews/${reviewId}/response`, { text: text });
    } catch (err) {
      console.error('Failed to send response:', err);
    } finally {
      setSubmittingResponse(false);
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reviews</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and respond to student feedback.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <Star className="w-6 h-6 text-yellow-500" />
            <div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.average}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search reviews..."
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

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Filter by Rating</h3>
              <div className="space-y-2">
                {['all', '5', '4', '3', '2', '1'].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${filterRating === rating
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {rating !== 'all' && <Star className="w-4 h-4" />}
                      {rating === 'all' ? 'All Reviews' : `${rating} Star`}
                    </span>
                    {rating !== 'all' && (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {stats.distribution[parseInt(rating)]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
              <div className="space-y-2">
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

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Reviews</div>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="p-6 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.average}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="p-6 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.responseRate}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Response Rate</div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {currentReviews.length > 0 ? (
              currentReviews.map(review => (
                <div
                  key={review.id}
                  className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student?.name || 'Student')}&background=random`}
                        alt={review.student?.name}
                        className="w-12 h-12 rounded-full border-2 object-cover"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{review.student?.name}</h4>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {review.student?.level || 'Student'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {review.date}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {review.session}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-green-600 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpful || 0})
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Responses: {review.responses?.length || 0}</div>
                      </div>
                    </div>
                  </div>

                  {review.responses && review.responses.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your Response</span>
                      </div>
                      {review.responses.map(response => (
                        <div key={response.id} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {response.text}
                          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>— {response.date}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!review.responses || review.responses.length === 0) && (
                    <div className="mt-4">
                      <button 
                        onClick={() => {
                          setSelectedReviewId(review.id);
                          setShowResponseModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Respond to this review
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No reviews found</h3>
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
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Respond to Review</h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setSelectedReviewId(null);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Review Preview */}
            {selectedReviewId && reviews.find(r => r.id === selectedReviewId) && (
              <div className="mb-6 p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={reviews.find(r => r.id === selectedReviewId)?.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviews.find(r => r.id === selectedReviewId)?.student?.name || 'Student')}&background=random`}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {reviews.find(r => r.id === selectedReviewId)?.student?.name}
                    </h4>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < (reviews.find(r => r.id === selectedReviewId)?.rating || 0) ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {reviews.find(r => r.id === selectedReviewId)?.comment}
                </p>
              </div>
            )}

            {/* Response Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a thoughtful response to this review..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                rows="5"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  borderColor: 'var(--input-border)'
                }}
              />
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {responseText.length}/500 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setSelectedReviewId(null);
                }}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                disabled={submittingResponse}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedReviewId && responseText.trim()) {
                    handleResponse(selectedReviewId, responseText);
                  }
                }}
                disabled={!responseText.trim() || submittingResponse}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingResponse ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;