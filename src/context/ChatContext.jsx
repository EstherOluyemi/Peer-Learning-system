// src/context/ChatContext.jsx
import React, {
    createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import {
    getConversations, getMessages, startConversation,
    sendMessage as httpSendMessage, markRead,
} from '../services/chatService';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [loading, setLoading] = useState(false);
    // Track which conversation IDs have been fully loaded (messages)
    const loadedConvs = useRef(new Set());

    // ── Total unread across all conversations ────────────────────────────────
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

    // ── Helper: upsert / prepend a conversation ──────────────────────────────
    const upsertConversation = useCallback((incoming) => {
        setConversations(prev => {
            const id = incoming._id || incoming.id;
            const idx = prev.findIndex(c => (c._id || c.id) === id);
            if (idx === -1) return [incoming, ...prev];
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...incoming };
            return updated;
        });
    }, []);

    // ── Fetch conversations ──────────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const list = await getConversations();
            setConversations(list);
        } catch (err) {
            console.error('[chat] Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ── Load messages (lazy, per conversation) ───────────────────────────────
    const loadMessages = useCallback(async (conversationId, page = 1) => {
        try {
            const result = await getMessages(conversationId, page);
            setConversations(prev =>
                prev.map(c => {
                    if ((c._id || c.id) !== conversationId) return c;
                    const existingIds = new Set((c.messages || []).map(m => m._id || m.id));
                    const fresh = (result.messages || []).filter(m => !existingIds.has(m._id || m.id));
                    return {
                        ...c,
                        messages: page === 1 ? result.messages : [...fresh, ...(c.messages || [])],
                        hasMore: result.hasMore,
                    };
                })
            );
            loadedConvs.current.add(conversationId);
            return result;
        } catch (err) {
            console.error('[chat] Failed to load messages:', err);
            return { messages: [], hasMore: false };
        }
    }, []);

    // ── Start or retrieve conversation ───────────────────────────────────────
    const openConversation = useCallback(async (recipientId) => {
        // Check local cache first
        const myId = user?._id || user?.id;
        const existing = conversations.find(c =>
            c.participants?.some(p => (p._id || p.id) === recipientId && (p._id || p.id) !== myId)
        );
        if (existing) return existing;

        const conv = await startConversation(recipientId);
        upsertConversation(conv);
        return conv;
    }, [conversations, user, upsertConversation]);

    // ── Send message (WS-first, HTTP fallback) ───────────────────────────────
    const sendMessage = useCallback(async (conversationId, text) => {
        const myId = user?._id || user?.id;
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            _id: tempId,
            text,
            sender: { _id: myId, id: myId },
            createdAt: new Date().toISOString(),
            read: false,
            pending: true,
        };

        // Optimistic UI update
        setConversations(prev =>
            prev.map(c => {
                if ((c._id || c.id) !== conversationId) return c;
                return {
                    ...c,
                    messages: [...(c.messages || []), optimistic],
                    lastMessage: text,
                    lastMessageAt: optimistic.createdAt,
                };
            })
        );

        // Try WebSocket first
        const sent = socketService.emit('message:send', { conversationId, text });

        if (!sent) {
            // Fallback: HTTP POST
            try {
                const saved = await httpSendMessage(conversationId, text);
                setConversations(prev =>
                    prev.map(c => {
                        if ((c._id || c.id) !== conversationId) return c;
                        return {
                            ...c,
                            messages: (c.messages || []).map(m =>
                                m._id === tempId ? { ...saved, pending: false } : m
                            ),
                        };
                    })
                );
            } catch (err) {
                console.error('[chat] HTTP send failed:', err);
                // Mark message as failed
                setConversations(prev =>
                    prev.map(c => {
                        if ((c._id || c.id) !== conversationId) return c;
                        return {
                            ...c,
                            messages: (c.messages || []).map(m =>
                                m._id === tempId ? { ...m, failed: true } : m
                            ),
                        };
                    })
                );
            }
        }
    }, [user]);

    // ── Mark conversation as read ─────────────────────────────────────────────
    const markConversationRead = useCallback(async (conversationId) => {
        setConversations(prev =>
            prev.map(c => (c._id || c.id) === conversationId ? { ...c, unread: 0 } : c)
        );
        try { await markRead(conversationId); } catch (e) { /* silent */ }
        socketService.emit('message:read', { conversationId });
    }, []);

    // ── WebSocket lifecycle ──────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('peerlearn_token');
        socketService.connect(token);

        // message:new – incoming real-time message
        const offNew = socketService.on('message:new', ({ conversationId, message }) => {
            setConversations(prev =>
                prev.map(c => {
                    if ((c._id || c.id) !== conversationId) return c;
                    const alreadyHas = (c.messages || []).some(m => (m._id || m.id) === (message._id || message.id));
                    return {
                        ...c,
                        messages: alreadyHas ? c.messages : [...(c.messages || []), message],
                        lastMessage: message.text,
                        lastMessageAt: message.createdAt,
                        unread: (c.unread || 0) + 1,
                    };
                })
            );
        });

        // message:sent – server confirms our WS send; replace optimistic entry
        const offSent = socketService.on('message:sent', ({ conversationId, message, tempId }) => {
            setConversations(prev =>
                prev.map(c => {
                    if ((c._id || c.id) !== conversationId) return c;
                    return {
                        ...c,
                        messages: (c.messages || []).map(m =>
                            (m._id === tempId || m.pending) && m.text === message.text
                                ? { ...message, pending: false }
                                : m
                        ),
                    };
                })
            );
        });

        // message:read – other party read our messages
        const offRead = socketService.on('message:read', ({ conversationId }) => {
            setConversations(prev =>
                prev.map(c => {
                    if ((c._id || c.id) !== conversationId) return c;
                    return {
                        ...c,
                        messages: (c.messages || []).map(m => ({ ...m, read: true })),
                    };
                })
            );
        });

        // conversation:new – someone started a conversation with us
        const offConvNew = socketService.on('conversation:new', (conv) => {
            upsertConversation(conv);
        });

        // online presence
        const offOnline = socketService.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });
        const offOffline = socketService.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
        });

        return () => {
            offNew(); offSent(); offRead(); offConvNew(); offOnline(); offOffline();
        };
    }, [user, upsertConversation]);

    // Disconnect on logout
    useEffect(() => {
        if (!user) {
            socketService.disconnect();
            setConversations([]);
            setOnlineUsers(new Set());
        } else {
            loadConversations();
        }
    }, [user, loadConversations]);

    const value = {
        conversations,
        totalUnread,
        onlineUsers,
        loading,
        loadConversations,
        loadMessages,
        openConversation,
        sendMessage,
        markConversationRead,
        upsertConversation,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within a ChatProvider');
    return ctx;
};
