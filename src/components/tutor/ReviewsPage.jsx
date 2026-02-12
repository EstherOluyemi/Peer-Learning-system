// src/components/tutor/ReviewsPage.jsx
import React, { useState } from 'react';
import {
  Star, Users, Calendar, TrendingUp, Filter, Search,
  ChevronLeft, ChevronRight, Eye, ThumbsUp, ThumbsDown, MessageCircle
} from 'lucide-react';

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const reviews = [
    {
      id: 1,
      student: {
        name: "Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random",
        level: "Beginner"
      },
      rating: 5,
      comment: "Sarah is an excellent tutor! She explained React concepts in a way that was easy to understand. The workshop was well-structured and I learned a lot. Highly recommended!",
      session: "React Fundamentals Workshop",
      date: "Dec 20, 2024",
      helpful: 12,
      responses: [
        {
          id: 1,
          text: "Thank you, Sarah! I'm glad you enjoyed the workshop. Keep up the great work with your React projects!",
          date: "Dec 21, 2024"
        }
      ]
    },
    {
      id: 2,
      student: {
        name: "Michael Chen",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random",
        level: "Intermediate"
      },
      rating: 4,
      comment: "Great session on JavaScript patterns. Michael provided excellent feedback on my project. The only suggestion would be to have more hands-on coding exercises.",
      session: "Advanced JavaScript 1-on-1",
      date: "Dec 18, 2024",
      helpful: 8,
      responses: [
        {
          id: 1,
          text: "Thanks for the feedback, Michael! I'll definitely incorporate more coding exercises in future sessions.",
          date: "Dec 19, 2024"
        }
      ]
    },
    {
      id: 3,
      student: {
        name: "Emily Rodriguez",
        avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random",
        level: "Advanced"
      },
      rating: 5,
      comment: "The UI/UX workshop was incredibly insightful. Emily has a great way of breaking down complex design principles. The practical exercises were very valuable.",
      session: "UI/UX Design Workshop",
      date: "Dec 15, 2024",
      helpful: 15,
      responses: []
    },
    {
      id: 4,
      student: {
        name: "David Kim",
        avatar: "https://ui-avatars.com/api/?name=David+Kim&background=random",
        level: "Beginner"
      },
      rating: 4,
      comment: "Good introduction to Python. David was patient and explained concepts clearly. Would have liked a bit more time for Q&A at the end.",
      session: "Python for Beginners",
      date: "Dec 12, 2024",
      helpful: 6,
      responses: [
        {
          id: 1,
          text: "Thanks for your feedback, David! I'll make sure to allocate more time for questions in future sessions.",
          date: "Dec 13, 2024"
        }
      ]
    },
    {
      id: 5,
      student: {
        name: "Lisa Thompson",
        avatar: "https://ui-avatars.com/api/?name=Lisa+Thompson&background=random",
        level: "Intermediate"
      },
      rating: 5,
      comment: "Outstanding tutor! Lisa's knowledge of data structures is impressive. The session was challenging but very rewarding. I feel much more confident now.",
      session: "Data Structures & Algorithms",
      date: "Dec 10, 2024",
      helpful: 20,
      responses: []
    },
    {
      id: 6,
      student: {
        name: "James Wilson",
        avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=random",
        level: "Beginner"
      },
      rating: 3,
      comment: "The session was okay, but I felt the pace was a bit too fast for a beginner like me. Some concepts went over my head.",
      session: "React Fundamentals Workshop",
      date: "Dec 8, 2024",
      helpful: 3,
      responses: [
        {
          id: 1,
          text: "I apologize for the pace, James. Let's schedule a follow-up session to go over the concepts at a more comfortable speed.",
          date: "Dec 9, 2024"
        }
      ]
    },
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.session.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const handleResponse = (reviewId, responseText) => {
    console.log(`Responding to review ${reviewId}: ${responseText}`);
    // In a real app, this would send the response to the backend
  };

  return (
    <div className="space-y-6">
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
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{getAverageRating()}</div>
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
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                      filterRating === rating
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
                        {getRatingDistribution()[parseInt(rating)]}
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
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>5 Star</span>
                  <span className="font-bold text-yellow-600">{getRatingDistribution()[5]}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>4 Star</span>
                  <span className="font-bold text-green-600">{getRatingDistribution()[4]}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
                  <span className="font-bold text-blue-600">85%</span>
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
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{reviews.length}</div>
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
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{getAverageRating()}</div>
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
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>85%</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Response Rate</div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {currentReviews.map(review => (
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
                      src={review.student.avatar}
                      alt={review.student.name}
                      className="w-12 h-12 rounded-full border-2 object-cover"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{review.student.name}</h4>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {review.student.level}
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
                        Helpful ({review.helpful})
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Responses: {review.responses.length}</div>
                    </div>
                  </div>
                </div>

                {review.responses.length > 0 && (
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

                {review.responses.length === 0 && (
                  <div className="mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Respond to this review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
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
    </div>
  );
};

export default ReviewsPage;