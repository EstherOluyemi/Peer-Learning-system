// Session API Service
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get all sessions (for learners to browse)
export const getAllSessions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/tutor/sessions`, { params: filters });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get tutor's sessions (for tutors to manage)
export const getTutorSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/tutor/sessions`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    throw error;
  }
};

// Create a new session (tutor only)
export const createSession = async (sessionData) => {
  try {
    const response = await axios.post(`${API_URL}/tutor/sessions`, sessionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error.response?.data?.message || error.message;
  }
};

// Update session (tutor only)
export const updateSession = async (sessionId, updateData) => {
  try {
    const response = await axios.patch(`${API_URL}/tutor/sessions/${sessionId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error.response?.data?.message || error.message;
  }
};

// Delete session (tutor only)
export const deleteSession = async (sessionId) => {
  try {
    await axios.delete(`${API_URL}/tutor/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error.response?.data?.message || error.message;
  }
};

// Get learner's enrolled sessions
export const getLearnerSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/learner/sessions`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching learner sessions:', error);
    throw error;
  }
};

// Join a session (learner only)
export const joinSession = async (sessionId) => {
  try {
    const response = await axios.post(`${API_URL}/learner/sessions/${sessionId}/join`);
    return response.data.data;
  } catch (error) {
    console.error('Error joining session:', error);
    throw error.response?.data?.message || error.message;
  }
};

// Get session details
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

// Leave session (learner only)
export const leaveSession = async (sessionId) => {
  try {
    const response = await axios.post(`${API_URL}/learner/sessions/${sessionId}/leave`);
    return response.data.data;
  } catch (error) {
    console.error('Error leaving session:', error);
    throw error.response?.data?.message || error.message;
  }
};
