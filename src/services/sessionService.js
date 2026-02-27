// Session API Service
import api from './api';

const normalizeSessions = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getSessionStatus = (session, now = new Date()) => {
  const current = (session?.status || '').toLowerCase();
  if (current === 'cancelled' || current === 'canceled') return 'cancelled';
  const start = session?.startTime ? new Date(session.startTime) : null;
  const end = session?.endTime ? new Date(session.endTime) : null;
  if (start && end) {
    if (now < start) return 'scheduled';
    if (now >= start && now <= end) return 'ongoing';
    if (now > end) return 'completed';
  }
  if (current === 'upcoming') return 'scheduled';
  if (current === 'scheduled' || current === 'ongoing' || current === 'completed') return current;
  return current || 'scheduled';
};

export const normalizeSessionList = (rawList, now = new Date()) =>
  (rawList || []).map((item) => {
    // Handle wrapped shape: { session: {...}, enrollmentStatus: '...' }
    const isWrapped = item && item.session && typeof item.session === 'object';
    const session = isWrapped ? item.session : item;
    const enrollmentStatus = isWrapped ? item.enrollmentStatus : item.enrollmentStatus;
    return {
      ...session,
      ...(enrollmentStatus !== undefined ? { enrollmentStatus } : {}),
      // Flatten tutor name for easy access in UI search / display
      tutorName: session.tutor?.name || session.tutorName || '',
      status: getSessionStatus(session, now)
    };
  });

const fetchSessions = async (endpoint, filters) => {
  const response = await api.get(endpoint, { params: filters });
  return normalizeSessions(response);
};

// Get all sessions (for learners to browse)
export const getAllSessions = async (filters = {}, options = {}) => {
  const normalizedRole = options?.role === 'student' ? 'learner' : options?.role;
  const endpoints = [
    '/v1/learner/sessions/browse',
    '/v1/learner/sessions/available',
    '/v1/sessions',
    '/sessions'
  ];

  if (normalizedRole === 'tutor') {
    endpoints.unshift('/v1/tutor/sessions');
  }

  let lastError;
  for (const endpoint of endpoints) {
    try {
      return await fetchSessions(endpoint, filters);
    } catch (error) {
      lastError = error;
      const code = error?.code;
      const status = error?.status;
      if (code === 'TUTOR_ONLY') {
        continue;
      }
      if (status === 403 && normalizedRole !== 'tutor') {
        continue;
      }
      if (status === 404 || status === 405) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

// Get tutor's sessions (for tutors to manage)
export const getTutorSessions = async () => {
  try {
    const response = await api.get('/v1/tutor/sessions');
    return normalizeSessions(response);
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    throw error;
  }
};

// Create a new session (tutor only)
export const createSession = async (sessionData) => {
  try {
    const response = await api.post('/v1/tutor/sessions', sessionData);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error.message || error;
  }
};

// Update session (tutor only)
export const updateSession = async (sessionId, updateData) => {
  try {
    const response = await api.patch(`/v1/tutor/sessions/${sessionId}`, updateData);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error.message || error;
  }
};

// Delete session (tutor only)
export const deleteSession = async (sessionId) => {
  try {
    await api.delete(`/v1/tutor/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error.message || error;
  }
};

// Get learner's enrolled sessions
export const getLearnerSessions = async () => {
  try {
    const response = await api.get('/v1/learner/sessions');
    return normalizeSessions(response);
  } catch (error) {
    console.error('Error fetching learner sessions:', error);
    throw error;
  }
};

// Join a session (learner only)
export const joinSession = async (sessionId) => {
  try {
    const response = await api.post(`/v1/learner/sessions/${sessionId}/join`);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error joining session:', error);
    throw error.message || error;
  }
};

// Get session details
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/v1/sessions/${sessionId}`);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

// Leave session (learner only)
export const leaveSession = async (sessionId) => {
  try {
    const response = await api.post(`/v1/learner/sessions/${sessionId}/leave`);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error leaving session:', error);
    throw error.message || error;
  }
};

// Get existing rating for a completed session (learner only)
export const getSessionRating = async (sessionId) => {
  try {
    const response = await api.get(`/v1/learner/sessions/${sessionId}/rate`);
    return response?.data ?? response;
  } catch (error) {
    // 404 simply means no rating yet — don't throw
    if (error?.status === 404) return null;
    console.error('Error fetching session rating:', error);
    return null;
  }
};

// Submit a rating for a completed session (learner only)
export const rateSession = async (sessionId, rating, comment = '') => {
  try {
    const response = await api.post(`/v1/learner/sessions/${sessionId}/rate`, { rating, comment });
    return response?.data ?? response;
  } catch (error) {
    console.error('Error rating session:', error);
    throw error.message || error;
  }
};

export const getTutorEnrollmentRequests = async (filters = {}) => {
  const endpoints = [
    '/v1/tutor/sessions/requests',
    '/v1/tutor/requests',
    '/v1/tutor/enrollments/requests'
  ];
  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint, { params: filters });
      const payload = response?.data ?? response;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    } catch (error) {
      lastError = error;
      const status = error?.status;
      if (status === 404 || status === 405) continue;
      throw error;
    }
  }
  if (lastError) throw lastError;
  return [];
};

export const approveEnrollmentRequest = async (requestId) => {
  const endpoints = [
    `/v1/tutor/sessions/requests/${requestId}/approve`,
    `/v1/tutor/requests/${requestId}/approve`,
    `/v1/tutor/enrollments/requests/${requestId}/approve`
  ];
  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint);
      return response?.data ?? response;
    } catch (error) {
      lastError = error;
      const status = error?.status;
      if (status === 404 || status === 405) continue;
      throw error;
    }
  }
  if (lastError) throw lastError;
  return null;
};

export const rejectEnrollmentRequest = async (requestId) => {
  const endpoints = [
    `/v1/tutor/sessions/requests/${requestId}/reject`,
    `/v1/tutor/requests/${requestId}/reject`,
    `/v1/tutor/enrollments/requests/${requestId}/reject`
  ];
  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint);
      return response?.data ?? response;
    } catch (error) {
      lastError = error;
      const status = error?.status;
      if (status === 404 || status === 405) continue;
      throw error;
    }
  }
  if (lastError) throw lastError;
  return null;
};
