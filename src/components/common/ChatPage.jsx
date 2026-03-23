// src/components/common/ChatPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare, Search, Send, X, Plus, Check, CheckCheck,
    ChevronLeft, AlertCircle, Loader2, Edit2, Smile,
} from 'lucide-react';
import { linkify } from '../../utils/textUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getContacts, editMessage, addReaction, removeReaction } from '../../services/chatService';
import socketService from '../../services/socketService';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const avatar = (name, src) =>
    src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&size=80`;

const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diff < 7 * 86_400_000) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const roleBadge = (role) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r === 'tutor') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
};

/* ─── sub-components ──────────────────────────────────────────────────────── */
const OnlineDot = ({ online }) =>
    online ? <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" /> : null;

/* ─── ChatPage ────────────────────────────────────────────────────────────── */
const ChatPage = ({ title = 'Messages', subtitle = 'Chat with your network.' }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const {
        conversations, loadMessages, openConversation, sendMessage,
        markConversationRead, onlineUsers, loading: ctxLoading,
    } = useChat();

    // Ensure we always extract the raw string ID, handling potential nesting
    const rawMyId = user?._id || user?.id || user?.tutor?._id || user?.data?._id;
    const myId = typeof rawMyId === 'object' && rawMyId !== null ? String(rawMyId) : rawMyId;

    useEffect(() => {
        console.log('[DEBUG ChatPage] Expanded user object:', user, '-> Resolved myId:', myId);
    }, [user, myId]);

    const [activeConvId, setActiveConvId] = useState(null);
    const [text, setText] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false); // remote user typing
    const [isTyping, setIsTyping] = useState(false); // I am typing
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [reactionMenuMessageId, setReactionMenuMessageId] = useState(null);
    const [editingError, setEditingError] = useState('');
    const [reactionError, setReactionError] = useState('');
    const [reactionEmojis] = useState(['👍', '❤️', '😂', '😮', '😢', '🎉', '👏', '🔥']);
    const typingTimer = useRef(null);
    const messagesEnd = useRef(null);
    const inputRef = useRef(null);

    const activeConv = conversations.find(c => (c._id || c.id) === activeConvId) || null;

    // ── Auto-open from router state ───────────────────────────────────────────
    useEffect(() => {
        const targetUserId = location.state?.openWithUserId;
        if (targetUserId && user) {
            // Clear state so reload doesn't re-trigger
            navigate(location.pathname, { replace: true, state: {} });
            openConversation(targetUserId).then(conv => {
                if (conv) setActiveConvId(conv._id || conv.id);
            }).catch(err => console.error('Failed to auto-open chat:', err));
        }
    }, [location.state?.openWithUserId, user, navigate, location.pathname, openConversation]);

    // ── Scroll to bottom ──────────────────────────────────────────────────────
    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConv?.messages?.length]);

    // ── Load messages when conversation is selected ───────────────────────────
    useEffect(() => {
        if (!activeConvId) return;
        setLoadingMessages(true);
        loadMessages(activeConvId).finally(() => setLoadingMessages(false));
        markConversationRead(activeConvId);
    }, [activeConvId]); // eslint-disable-line

    // ── Typing indicators ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeConvId) return;
        const off = socketService.on('user:typing', ({ conversationId, userId }) => {
            if (conversationId === activeConvId && userId !== myId) {
                setTyping(true);
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => setTyping(false), 3000);
            }
        });
        return () => { off(); clearTimeout(typingTimer.current); };
    }, [activeConvId, myId]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.emit('user:typing', { conversationId: activeConvId });
            setTimeout(() => setIsTyping(false), 2500);
        }
    };

    // ── Send ──────────────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        const trimmed = text.trim();
        if (!trimmed || !activeConvId || sending) return;
        setText('');
        setSending(true);
        try {
            await sendMessage(activeConvId, trimmed);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }, [text, activeConvId, sending, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Shift+Enter: allow newline
                handleTyping();
            } else {
                // Enter alone: send message
                e.preventDefault();
                handleSend();
            }
        } else {
            handleTyping();
        }
    };

    // ── Edit message ──────────────────────────────────────────────────────────
    const startEdit = (message) => {
        setEditingMessageId(message._id || message.id);
        setEditText(message.text);
        setEditingError('');
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditText('');
        setEditingError('');
    };

    const submitEdit = async () => {
        const trimmed = editText.trim();
        if (!trimmed) {
            setEditingError('Message cannot be empty');
            return;
        }
        try {
            await editMessage(editingMessageId, trimmed);
            cancelEdit();
        } catch (err) {
            setEditingError(err.message || 'Failed to edit message');
        }
    };

    // ── React to message ───────────────────────────────────────────────────────
    const handleReaction = async (messageId, emoji, hasReacted = false) => {
        const normalizedId = String(messageId || '');
        if (!normalizedId || normalizedId.startsWith('temp-')) return;

        setReactionError('');
        try {
            if (hasReacted) {
                await removeReaction(normalizedId, emoji);
            } else {
                await addReaction(normalizedId, emoji);
            }
            if (activeConvId) {
                await loadMessages(activeConvId);
            }
            setReactionMenuMessageId(null);
        } catch (err) {
            setReactionError(err?.message || 'Failed to update reaction');
            console.error('[chat] Failed to update reaction:', err);
        }
    };

    // ── Select conversation ───────────────────────────────────────────────────
    const selectConv = (conv) => {
        setActiveConvId(conv._id || conv.id);
    };

    // ── Load contacts for new-message modal ──────────────────────────────────
    const openNewModal = async () => {
        setShowModal(true);
        setLoadingContacts(true);
        try {
            const list = await getContacts();
            setContacts(list);
        } catch {
            setContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };

    const startWith = async (contact) => {
        setShowModal(false);
        const conv = await openConversation(contact._id || contact.id);
        if (conv) setActiveConvId(conv._id || conv.id);
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const filteredConvs = conversations.filter(c => {
        const other = getOtherParticipant(c, myId);
        return (other?.name || '').toLowerCase().includes(search.toLowerCase());
    });

    const filteredContacts = contacts.filter(c =>
        (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(contactSearch.toLowerCase())
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
                </div>
                <button
                    onClick={openNewModal}
                    aria-label="Start a new message"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" /> New Message
                </button>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>

                {/* ── Conversation list ── */}
                <div
                    className="lg:col-span-1 rounded-2xl border overflow-hidden flex flex-col"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                    {/* Search */}
                    <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search conversations…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500"
                                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                                aria-label="Search conversations"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {ctxLoading ? (
                            <div className="flex items-center justify-center h-24">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : filteredConvs.length > 0 ? (
                            filteredConvs.map(conv => {
                                const other = getOtherParticipant(conv, myId);
                                const isActive = (conv._id || conv.id) === activeConvId;
                                const isOnline = onlineUsers.has(other?._id || other?.id);
                                return (
                                    <button
                                        key={conv._id || conv.id}
                                        onClick={() => selectConv(conv)}
                                        aria-label={`Chat with ${other?.name || 'Unknown'}${conv.unread > 0 ? `, ${conv.unread} unread messages` : ''}`}
                                        aria-current={isActive ? 'true' : 'false'}
                                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/25'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <div className="relative shrink-0">
                                            <img src={avatar(other?.name, other?.avatar)} alt=""
                                                className="w-10 h-10 rounded-full object-cover border-2"
                                                style={{ borderColor: 'var(--border-color)' }} />
                                            <OnlineDot online={isOnline} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {other?.name || 'Unknown'}
                                                </span>
                                                <span className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                                                    {formatTime(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                                    {conv.lastMessage || 'No messages yet'}
                                                </p>
                                                {conv.unread > 0 && (
                                                    <span className="bg-blue-600 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold shrink-0" aria-label={`${conv.unread} unread messages`}>
                                                        {conv.unread > 9 ? '9+' : conv.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-2">
                                <MessageSquare className="w-8 h-8 text-slate-400" />
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No conversations</p>
                                <button onClick={openNewModal} className="text-xs text-blue-600 hover:underline">Start one</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Chat area ── */}
                <div
                    className="lg:col-span-3 rounded-2xl border flex flex-col overflow-hidden"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                    {activeConv ? (
                        <>
                            {/* Chat header */}
                            {(() => {
                                const other = getOtherParticipant(activeConv, myId);
                                const isOnline = onlineUsers.has(other?._id || other?.id);
                                return (
                                    <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
                                        style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="relative">
                                            <img src={avatar(other?.name, other?.avatar)} alt=""
                                                className="w-10 h-10 rounded-full object-cover border-2"
                                                style={{ borderColor: 'var(--border-color)' }} />
                                            <OnlineDot online={isOnline} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{other?.name}</h3>
                                                {other?.role && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${roleBadge(other.role)}`}>
                                                        {other.role}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs" style={{ color: isOnline ? '#22c55e' : 'var(--text-tertiary)' }}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    </div>
                                ) : (activeConv.messages || []).length > 0 ? (
                                    (activeConv.messages || []).map((msg) => {
                                        const senderId = String(msg.sender?._id || msg.sender?.id || msg.sender);
                                        const myIdStr = String(myId?._id || myId?.id || myId);
                                        const isMine = senderId === myIdStr;
                                        return (
                                            <div key={msg._id || msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                                                {!isMine && (() => {
                                                    const other = getOtherParticipant(activeConv, myId);
                                                    return (
                                                        <img src={avatar(other?.name, other?.avatar)} alt=""
                                                            className="w-6 h-6 rounded-full object-cover shrink-0 mb-1" />
                                                    );
                                                })()}
                                                <div className={`max-w-xs lg:max-w-sm xl:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                                    {/* Message bubble with actions */}
                                                    <div className="flex items-center gap-1.5 group/message">
                                                        {isMine && (
                                                            <button
                                                                onClick={() => startEdit(msg)}
                                                                className="opacity-0 group-hover/message:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                                aria-label="Edit message"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                                                            </button>
                                                        )}
                                                        <div className={`relative px-4 py-2.5 rounded-2xl text-sm break-words ${isMine
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : 'bg-slate-100 dark:bg-slate-800 rounded-bl-sm'}`}
                                                            style={isMine ? {} : { color: 'var(--text-primary)' }}>
                                                            {linkify(msg.text, isMine ? "text-white font-bold hover:underline" : "text-blue-600 dark:text-blue-400 font-bold hover:underline")}
                                                            {msg.isEdited && (
                                                                <span className="text-xs ml-2 opacity-75">(edited)</span>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setReactionMenuMessageId(reactionMenuMessageId === (msg._id || msg.id) ? null : (msg._id || msg.id))}
                                                                className="opacity-0 group-hover/message:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                                aria-label="Add reaction"
                                                                aria-expanded={reactionMenuMessageId === (msg._id || msg.id)}
                                                            >
                                                                <Smile className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                                                            </button>
                                                            {/* Reaction emoji picker */}
                                                            {reactionMenuMessageId === (msg._id || msg.id) && (
                                                                <div className={`absolute ${isMine ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg p-2 flex gap-1 z-10`} role="menu">
                                                                    {reactionEmojis.map(emoji => (
                                                                        <button
                                                                            key={emoji}
                                                                            role="menuitem"
                                                                            aria-label={`React with ${emoji}`}
                                                                            onClick={() => {
                                                                                const myIdStr = String(myId?._id || myId?.id || myId || '');
                                                                                const alreadyReacted = (msg.reactions || []).some(r => {
                                                                                    const reactionUserId = String(r.userId?._id || r.userId?.id || r.userId || '');
                                                                                    return r.emoji === emoji && reactionUserId === myIdStr;
                                                                                });
                                                                                handleReaction(msg._id || msg.id, emoji, alreadyReacted);
                                                                            }}
                                                                            className="text-lg hover:scale-125 transition-transform cursor-pointer"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reactions display */}
                                                    {(msg.reactions || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                                                                const count = msg.reactions.filter(r => r.emoji === emoji).length;
                                                                const myIdStr = String(myId?._id || myId?.id || myId || '');
                                                                const userReacted = msg.reactions.some(r => {
                                                                    const reactionUserId = String(r.userId?._id || r.userId?.id || r.userId || '');
                                                                    return r.emoji === emoji && reactionUserId === myIdStr;
                                                                });
                                                                return (
                                                                    <button
                                                                        key={emoji}
                                                                        onClick={() => handleReaction(msg._id || msg.id, emoji, userReacted)}
                                                                        aria-label={`${userReacted ? 'Remove' : 'Add'} reaction ${emoji}`}
                                                                        className={`text-sm px-2 py-1 rounded-full transition-colors ${userReacted
                                                                            ? 'bg-blue-200 dark:bg-blue-900/40'
                                                                            : 'bg-slate-100 dark:bg-slate-700 opacity-60 hover:opacity-100'}`}
                                                                    >
                                                                        <span aria-hidden="true">{emoji}</span> {count}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Time and read status */}
                                                    <div className={`flex items-center gap-1 text-xs ${isMine ? 'justify-end' : 'justify-start'}`}
                                                        style={{ color: 'var(--text-tertiary)' }}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isMine && (
                                                            msg.pending ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                                                                : msg.failed ? <AlertCircle className="w-3 h-3 text-red-500" aria-label="Failed to send" />
                                                                    : msg.read ? <CheckCheck className="w-3 h-3 text-blue-400" aria-label="Read" />
                                                                        : <Check className="w-3 h-3" aria-label="Delivered" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 py-16">
                                        <MessageSquare className="w-12 h-12 text-slate-300" aria-hidden="true" />
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Say hello!</p>
                                    </div>
                                )}

                                 {/* Typing indicator */}
                                {typing && (
                                    <div className="flex items-center gap-2" aria-live="polite">
                                        {(() => {
                                            const other = getOtherParticipant(activeConv, myId);
                                            return <img src={avatar(other?.name, other?.avatar)} alt="" className="w-6 h-6 rounded-full shrink-0" />;
                                        })()}
                                        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm" aria-label={`${getOtherParticipant(activeConv, myId)?.name || 'Someone'} is typing`}>
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${i * 150}ms` }} aria-hidden="true" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEnd} />
                            </div>

                            {reactionError && (
                                <div className="px-4 pb-2">
                                    <p className="text-xs text-red-500">{reactionError}</p>
                                </div>
                            )}

                            {/* Input */}
                            <div className="px-4 py-3 border-t flex items-end gap-3 shrink-0"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <textarea
                                    ref={inputRef}
                                    placeholder="Type a message… (Shift+Enter for new line)"
                                    value={text}
                                    onChange={e => { setText(e.target.value); handleTyping(); }}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 px-4 py-2.5 rounded-2xl text-sm border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', maxHeight: '120px', minHeight: '44px' }}
                                    rows="1"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!text.trim() || sending}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    aria-label="Send message"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <MessageSquare className="w-16 h-16 text-slate-300" aria-hidden="true" />
                            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Select a conversation</p>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Or start a new one</p>
                            <button onClick={openNewModal} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Start New Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Edit Message Modal ── */}
            {editingMessageId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={cancelEdit}>
                    <div role="dialog" aria-modal="true" aria-labelledby="edit-message-title" className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: 'var(--card-bg)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="px-6 py-5 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <h2 id="edit-message-title" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Edit Message</h2>
                            <button onClick={cancelEdit}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close edit modal">
                                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-4 space-y-3">
                            <textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', minHeight: '100px' }}
                                autoFocus
                                aria-label="Edit message text"
                            />
                            {editingError && (
                                <p className="text-xs text-red-500" aria-live="assertive">{editingError}</p>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t flex items-center justify-end gap-3"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <button onClick={cancelEdit}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                                Cancel
                            </button>
                            <button onClick={submitEdit}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── New Message Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="new-message-title" className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: 'var(--card-bg)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="px-6 py-5 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <h2 id="new-message-title" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New Message</h2>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close new message modal">
                                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Search contacts */}
                        <div className="px-6 pt-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email…"
                                    value={contactSearch}
                                    onChange={e => setContactSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500"
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                                    autoFocus
                                    aria-label="Search contacts"
                                />
                            </div>
                        </div>



                        {/* Contact list */}
                        <div className="px-3 pb-4 max-h-72 overflow-y-auto mt-3 space-y-1">
                            {loadingContacts ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            ) : filteredContacts.length > 0 ? (
                                filteredContacts.map(c => (
                                    <button
                                        key={c._id || c.id}
                                        onClick={() => startWith(c)}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                    >
                                        <div className="relative">
                                            <img src={avatar(c.name, c.avatar)} alt={c.name}
                                                className="w-10 h-10 rounded-full object-cover border-2"
                                                style={{ borderColor: 'var(--border-color)' }} />
                                            <OnlineDot online={onlineUsers.has(c._id || c.id)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                                                {c.role && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${roleBadge(c.role)}`}>
                                                        {c.role}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.email}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                                    {contactSearch ? 'No contacts match your search' : 'No contacts available'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Helper: get the other participant in a 1-to-1 conversation ───────────── */
function getOtherParticipant(conv, myId) {
    if (!conv) return null;
    const participants = conv.participants || [];

    const myIdStr = String(myId?._id || myId?.id || myId || '');
    if (!myIdStr || myIdStr === 'undefined') return null;

    // prefer the explicit participant that isn't the current user
    const other = participants.find(p => {
        const pIdStr = String(p?._id || p?.id || '');
        return pIdStr && pIdStr !== myIdStr;
    });

    // fallback to conv.recipient / conv.student / conv.tutor (older shape)
    return other || conv.recipient || conv.student || conv.tutor || null;
}

export default ChatPage;
