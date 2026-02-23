// src/pages/SessionRoom.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Shield,
  Users,
  Video,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoogleMeetEmbed from '../components/meet/GoogleMeetEmbed';
import { featureFlags } from '../config/featureFlags';

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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState('');
  const [sending, setSending] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
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
  const chatEnabled = participantAllowed && sessionActive && !sessionEnded;

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
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !chatEnabled) {
      setChatMessages([]);
      return;
    }
    let pollingId;
    const fetchChat = async () => {
      try {
        // FIX: use the correct chat endpoint matching whichever session route worked
        const response = await api.get(`/v1/tutor/sessions/${sessionId}/chat`);
        const payload = response?.data || response;
        setChatMessages(Array.isArray(payload) ? payload : payload?.messages || []);
        setChatError('');
      } catch (err) {
        setChatError(err.message || 'Unable to load chat messages.');
      }
    };
    if (chatSocketBase) {
      return undefined;
    }
    fetchChat();
    pollingId = setInterval(fetchChat, 4000);
    return () => {
      if (pollingId) clearInterval(pollingId);
    };
  }, [sessionId, chatEnabled, chatSocketBase]);

  useEffect(() => {
    if (!chatEnabled || !chatSocketBase || !sessionId) {
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
  }, [chatEnabled, chatSocketBase, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (sessionEnded) {
      setChatMessages([]);
      setChatInput('');
    }
  }, [sessionEnded]);

  const handleSend = async () => {
    if (!chatInput.trim() || !chatEnabled) return;
    const optimisticMessage = {
      id: `${Date.now()}`,
      text: chatInput.trim(),
      senderId: user?.id || user?._id,
      senderName: user?.name || 'Participant',
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, optimisticMessage]);
    setChatInput('');
    setSending(true);
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'message', message: optimisticMessage }));
      } else {
        await api.post(`/v1/tutor/sessions/${sessionId}/chat`, {
          text: optimisticMessage.text
        });
      }
      setChatError('');
    } catch (err) {
      setChatError(err.message || 'Failed to send message.');
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
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
      <div className="border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="container mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to={user?.role === 'tutor' ? '/dashboard-tutor/sessions' : '/dashboard-learner/sessions'} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Sessions
            </Link>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{session?.title || 'Session Room'}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {startDisplay.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {startDisplay.time} - {endDisplay.time}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              {session?.studentIds?.length || 0}/{session?.maxParticipants || 0}
            </span>
          </div>
        </div>
      </div>

      {!online && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-700">
          <div className="container mx-auto px-6 py-3 flex items-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            You are offline. Reconnect to use video and chat features.
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <section className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Live Session</h2>
              </div>
              {meetingLink && (
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Open in new tab
                </a>
              )}
            </div>
            <div className="bg-black/90">
              {featureFlags.googleMeetEmbed ? (
                <GoogleMeetEmbed meetingLink={meetingLink} />
              ) : (
                <>
                  {meetingLink ? (
                    <iframe
                      title="Google Meet Session"
                      src={meetingLink}
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                      className="w-full h-105 md:h-130 lg:h-160"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-105 px-6">
                      <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                      <p className="text-sm font-medium text-white">Meeting link unavailable.</p>
                      <p className="text-xs text-slate-300 mt-1">Contact support or refresh to try again.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {sessionEnded ? 'This session has ended. The meeting is read-only.' : sessionActive ? 'Session is live. Join now.' : 'Session has not started yet.'}
            </div>
          </section>

          <section className="rounded-2xl shadow-sm border flex flex-col" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Live Chat</h2>
              </div>
              {sessionActive && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${chatEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {chatEnabled ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            {chatError && (
              <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {chatError}
              </div>
            )}
            {!chatEnabled && (
              <div className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Chat is available while the session is live.
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {chatEnabled && chatMessages.length === 0 && (
                <div className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  No messages yet. Start the conversation.
                </div>
              )}
              {chatMessages.map((message) => {
                const isOwn = normalizeId(message.senderId) === normalizeId(user?.id || user?._id);
                return (
                  <div key={message.id || message.timestamp || Math.random()} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <div className="text-xs font-semibold mb-1 opacity-80">{message.senderName || 'Participant'}</div>
                      <div>{message.text || message.message}</div>
                      <div className="text-[10px] mt-1 opacity-70">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={chatEnabled ? 'Type your message...' : 'Chat opens when the session starts'}
                  disabled={!chatEnabled || sending || !online}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!chatEnabled || sending || !online}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
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
    </div>
  );
};

export default SessionRoom;
