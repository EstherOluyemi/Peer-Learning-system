// src/services/chatService.js
import api from './api';

const normalize = (res) => {
    const p = res?.data ?? res;
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.data)) return p.data;
    return p ?? null;
};

/** Fetch all conversations for the current user */
export const getConversations = async () => {
    const res = await api.get('/v1/chat/conversations');
    return normalize(res) ?? [];
};

/**
 * Fetch paginated message history for a conversation.
 * @param {string} conversationId
 * @param {number} page – 1-based page number
 */
export const getMessages = async (conversationId, page = 1) => {
    const res = await api.get(`/v1/chat/conversations/${conversationId}/messages`, {
        params: { page, limit: 50 },
    });
    const payload = res?.data ?? res;
    return {
        messages: Array.isArray(payload?.messages) ? payload.messages
            : Array.isArray(payload) ? payload : [],
        hasMore: payload?.hasMore ?? false,
        total: payload?.total ?? 0,
    };
};

/**
 * Create or retrieve a conversation with a recipient.
 * @param {string} recipientId
 */
export const startConversation = async (recipientId) => {
    const res = await api.post('/v1/chat/conversations', { recipientId });
    return normalize(res);
};

/**
 * HTTP fallback: send a message without WebSocket.
 * @param {string} conversationId
 * @param {string} text
 */
export const sendMessage = async (conversationId, text) => {
    const res = await api.post(`/v1/chat/conversations/${conversationId}/messages`, { text });
    return normalize(res);
};

/**
 * Mark all messages in a conversation as read by the current user.
 * @param {string} conversationId
 */
export const markRead = async (conversationId) => {
    await api.patch(`/v1/chat/conversations/${conversationId}/read`);
};

/**
 * Get all users the current user is allowed to chat with.
 * Backend filters by role: tutors see students + tutors; learners see tutors + other learners.
 */
export const getContacts = async () => {
    const res = await api.get('/v1/chat/contacts');
    return normalize(res) ?? [];
};

/**
 * Edit an existing message.
 * @param {string} messageId
 * @param {string} newText
 */
export const editMessage = async (messageId, newText) => {
    const res = await api.patch(`/v1/chat/messages/${messageId}`, { text: newText });
    return normalize(res);
};

/**
 * Add or toggle a reaction emoji on a message.
 * @param {string} messageId
 * @param {string} emoji
 */
export const addReaction = async (messageId, emoji) => {
    const res = await api.post(`/v1/chat/messages/${messageId}/react`, { emoji });
    return normalize(res);
};

/**
 * Remove a reaction emoji from a message.
 * @param {string} messageId
 * @param {string} emoji
 */
export const removeReaction = async (messageId, emoji) => {
    const res = await api.delete(`/v1/chat/messages/${messageId}/react`, { data: { emoji } });
    return normalize(res);
};
