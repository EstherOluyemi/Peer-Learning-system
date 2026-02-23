// Session API Service
import api from './api';

const normalizeSessions = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

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
