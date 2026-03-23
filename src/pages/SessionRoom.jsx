// src/pages/SessionRoom.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Send,
  Shield,
  Users,
  Video,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  getSessionChat, 
  sendSessionChatMessage,
  getLearnerProgress,
  updateLearnerProgress
} from '../services/sessionService';
import { linkify } from '../utils/textUtils';

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    return value._id || value.id || null;
  }
  return value;
};

const isSessionParticipant = (session, user) => {
  if (!session || !user) return false;

  // FIX: Tutors fetched this via /v1/tutor/sessions/:id which requires tutor auth.
  // If we got the session data, the backend already confirmed they own it.
  // Checking IDs here fails because session.tutorId is the Tutor doc _id,
  // but user.id is the User doc _id — they are different documents.
  if (user?.role === 'tutor') return true;

  // For students/learners: check studentIds list
  const userId = normalizeId(user.id || user._id);
  if (!userId) return false;
  const studentIds = (session.studentIds || []).map(normalizeId);
  return studentIds.includes(userId);
};

const getSessionTiming = (session) => {
  const start = session?.startTime ? new Date(session.startTime) : null;
  const end = session?.endTime ? new Date(session.endTime) : null;
  return { start, end };
};

const isSessionActive = (session, now = new Date()) => {
  if (!session) return false;
  const { start, end } = getSessionTiming(session);
  if (!start || !end) return session.status === 'ongoing';
  return now >= start && now <= end;
};

const isSessionEnded = (session, now = new Date()) => {
  if (!session) return false;
  if (['completed', 'cancelled'].includes(session.status)) return true;
  const { end } = getSessionTiming(session);
  return end ? now > end : false;
};

const formatDateTime = (date) => {
  if (!date) return { date: 'TBD', time: 'TBD' };
  const parsed = new Date(date);
  return {
    date: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
};

// FIX: Use the correct API route based on user role.
const fetchSessionById = async (sessionId, userRole) => {
  if (userRole === 'tutor') {
    const response = await api.get(`/v1/tutor/sessions/${sessionId}`);
    const payload = response?.data || response;
    return payload?.data || payload;
  }
  // Learner route
  try {
    const response = await api.get(`/v1/learner/sessions/${sessionId}`);
    const payload = response?.data || response;
    return payload?.data || payload;
  } catch (err) {
    // Fallback: learner route may not exist yet
    if (err?.response?.status === 404) {
      const response = await api.get(`/v1/tutor/sessions/${sessionId}`);
      const payload = response?.data || response;
      return payload?.data || payload;
    }
    throw err;
  }
};

const SessionRoom = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState('');
  const [sending, setSending] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [learnerProgress, setLearnerProgress] = useState(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const chatSocketBase = import.meta.env.VITE_CHAT_WS_URL;

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const participantAllowed = useMemo(() => isSessionParticipant(session, user), [session, user]);
  const sessionActive = useMemo(() => isSessionActive(session), [session]);
  const sessionEnded = useMemo(() => isSessionEnded(session), [session]);
  // Chat is always available for participants (persistent group chat per session)
  const chatEnabled = participantAllowed;

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchSessionById(sessionId, user?.role);
        if (!data) {
          setError('Session not found.');
          return;
        }
        setSession(data);
        
        // Fetch learner progress if applicable
        if (user?.role === 'learner' && data.modules?.length > 0) {
          try {
            const allProgress = await getLearnerProgress();
            const sessionProgress = allProgress.find(p => {
              const pCourseId = normalizeId(p.courseId);
              return pCourseId === sessionId;
            });
            if (sessionProgress) {
              setLearnerProgress(sessionProgress);
            }
          } catch (progressErr) {
            console.error('Failed to fetch progress:', progressErr);
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError('Session not found.');
        } else if (status === 403) {
          setError('You do not have access to this session.');
        } else {
          setError(err.message || 'Failed to load session.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, user?.role]);

  // Load materials for the session
  useEffect(() => {
    if (!sessionId) return;
    const loadMaterials = async () => {
      try {
        setMaterialsLoading(true);
        // Fetch materials filtered by this session
        const response = await api.get('/v1/tutor/materials', {
          params: { sessionId, page: 1, limit: 50 }
        });
        // Handle both direct array and nested structure
        const materialsList = Array.isArray(response.data) ? response.data : (response.data?.materials || []);
        setMaterials(materialsList);
      } catch (err) {
        console.error('Failed to load materials:', err);
        // Don't show error to user - materials are optional
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };
    loadMaterials();
  }, [sessionId]);

  // Load chat messages from backend
  useEffect(() => {
    if (!sessionId || !participantAllowed) {
      setChatMessages([]);
      return;
    }
    const loadChat = async () => {
      try {
        setChatLoading(true);
        setChatError('');
        const chatData = await getSessionChat(sessionId, { limit: 100 });
        setChatMessages(chatData.messages || []);
      } catch (err) {
        console.error('Failed to load chat:', err);
        setChatError('Failed to load chat messages.');
      } finally {
        setChatLoading(false);
      }
    };
    loadChat();
  }, [sessionId, participantAllowed]);

  // WebSocket for real-time chat updates
  useEffect(() => {
    if (!participantAllowed || !chatSocketBase || !sessionId) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }
    const token = localStorage.getItem('peerlearn_token');
    const socketUrl = new URL(chatSocketBase);
    const normalizedPath = socketUrl.pathname.endsWith('/') ? socketUrl.pathname.slice(0, -1) : socketUrl.pathname;
    socketUrl.pathname = `${normalizedPath}/sessions/${sessionId}`;
    if (token) {
      socketUrl.searchParams.set('token', token);
    }
    const socket = new WebSocket(socketUrl.toString());
    socketRef.current = socket;
    socket.onopen = () => {
      setChatConnected(true);
      setChatError('');
    };
    socket.onerror = () => {
      setChatError('Chat connection error. Reconnecting...');
    };
    socket.onclose = () => {
      setChatConnected(false);
    };
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const message = payload?.message || payload;
        if (message) {
          setChatMessages((prev) => [...prev, message]);
        }
      } catch {
        setChatError('Chat update failed.');
      }
    };
    return () => {
      socket.close();
    };
  }, [participantAllowed, chatSocketBase, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (sessionEnded) {
      setChatMessages([]);
      setChatInput('');
    }
  }, [sessionEnded]);

  const handleMarkComplete = async (moduleText) => {
    if (isUpdatingProgress || !session) return;
    
    setIsUpdatingProgress(true);
    try {
      await updateLearnerProgress(session._id, moduleText);
      // Refresh progress
      const allProgress = await getLearnerProgress();
      const sessionProgress = allProgress.find(p => {
        const pCourseId = normalizeId(p.courseId);
        return pCourseId === session._id;
      });
      if (sessionProgress) {
        setLearnerProgress(sessionProgress);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSend = async () => {
    if (!chatInput.trim() || !chatEnabled) return;
    const messageText = chatInput.trim();
    setChatInput('');
    setSending(true);
    try {
      // Send to backend API
      const sentMessage = await sendSessionChatMessage(sessionId, messageText);
      
      // Add to local state if not already added by WebSocket
      if (sentMessage) {
        const messageId = sentMessage._id || sentMessage.id;
        const exists = chatMessages.some(m => (m._id || m.id) === messageId);
        if (!exists) {
          setChatMessages((prev) => [...prev, sentMessage]);
        }
      }
      
      setChatError('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatError(err.message || 'Failed to send message.');
      // Restore the input on error
      setChatInput(messageText);
    } finally {
      setSending(false);
    }
  };

  const meetingLink = session?.meetingLink || session?.meetingUrl || session?.googleMeetUrl;
  const startDisplay = formatDateTime(session?.startTime);
  const endDisplay = formatDateTime(session?.endTime);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-xl w-full p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Unable to load session</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!participantAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-xl w-full p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Access restricted</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                This session is only available to registered participants.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to={user?.role === 'tutor' ? '/dashboard-tutor/sessions' : '/dashboard-learner/sessions'} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Sessions
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold mt-2 wrap-break-word" style={{ color: 'var(--text-primary)' }}>{session?.title || 'Session Room'}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {startDisplay.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {startDisplay.time} - {endDisplay.time}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4" aria-hidden="true" />
              {session?.studentIds?.length || 0}/{session?.maxParticipants || 0}
            </span>
          </div>
        </div>
      </header>

      {!online && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            You are offline. Reconnect to use video and chat features.
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
          <div className="space-y-4 sm:space-y-6">


            <section className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <Video className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Live Session</h2>
              </div>
              <div className="bg-slate-900 flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-8 text-center min-h-64 sm:min-h-80">
                {meetingLink ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
                      <Video className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to join?</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-xs">
                      Google Meet opens in a new tab. Come back here for chat and session info.
                    </p>
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full sm:w-auto max-w-xs items-center justify-center gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
                    >
                      <Video className="w-6 h-6" />
                      Join Google Meet
                    </a>
                    <p className="text-xs text-slate-500 mt-4">
                      {sessionActive ? 'Session is live now' : sessionEnded ? 'Session has ended' : 'Session has not started yet'}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-sm font-medium text-white">Meeting link unavailable.</p>
                    <p className="text-xs text-slate-400">Contact your tutor or refresh the page.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Materials Section */}
            <section className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <FileText className="w-5 h-5 text-green-600" aria-hidden="true" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Session Materials</h2>
              </div>
              <div className="p-4">
                {materialsLoading ? (
                  <div className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                    Loading materials...
                  </div>
                ) : materials.length > 0 ? (
                  <div className="space-y-2">
                    {materials.map((material) => {
                      const materialId = material._id || material.id;
                      return (
                        <div key={materialId} className="p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}>
                          <div className="flex-1 min-w-0 w-full">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{material.title}</p>
                            {material.description && (
                              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{material.description}</p>
                            )}
                          </div>
                          {material.fileUrl && (
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 transition inline-flex items-center justify-center"
                              title={`Download ${material.title}`}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                    No materials uploaded yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl shadow-sm border flex flex-col" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Group Chat</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>All {session?.studentIds?.length || 0} participants</p>
                </div>
              </div>
            </div>
            {chatError && (
              <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {chatError}
              </div>
            )}
            {!chatEnabled && (
              <div className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                You must be enrolled in this session to chat.
              </div>
            )}
            <div 
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3" 
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-label="Chat messages"
            >
              {chatLoading && (
                <div className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  Loading chat...
                </div>
              )}
              {chatEnabled && !chatLoading && chatMessages.length === 0 && (
                <div className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  No messages yet. Start the conversation.
                </div>
              )}
              {chatMessages.map((message) => {
                const senderId = message.sender?._id || message.sender?.id || message.senderId || message.sender;
                const senderName = message.sender?.name || message.senderName || 'Participant';
                const messageText = message.message || message.text || '';
                const isOwn = normalizeId(senderId) === normalizeId(user?.id || user?._id);
                return (
                  <div 
                    key={message._id || message.id || message.timestamp || Math.random()} 
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    role="article"
                    aria-label={`Message from ${senderName}: ${messageText}`}
                  >
                    <div className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
                      <div className="text-xs font-semibold mb-1 opacity-80">{senderName}</div>
                      <div className="whitespace-pre-wrap break-word">{linkify(messageText, isOwn ? "text-white font-bold hover:underline" : "text-blue-600 dark:text-blue-400 font-bold hover:underline")}</div>
                      <div className="text-[10px] mt-1 opacity-70">
                        {message.timestamp || message.createdAt ? new Date(message.timestamp || message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={chatEnabled ? 'Type your message... (Enter to send, Shift+Enter for new line)' : 'Chat opens when the session starts'}
                  disabled={!chatEnabled || sending || !online}
                  aria-label="Chat message input. Press Enter to send, Shift+Enter for new line"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!chatEnabled || sending || !online}
                  aria-label="Send chat message"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Send
                </button>
              </div>
              {chatSocketBase && (
                <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  {chatConnected ? 'Connected' : 'Connecting...'}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    <footer className="mt-auto py-6 border-t bg-slate-50 dark:bg-slate-900/50" style={{ borderColor: 'var(--card-border)' }}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; 2026 PeerLearn. All rights reserved. • <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  </div>
  );
};

export default SessionRoom;
