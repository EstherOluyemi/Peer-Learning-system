// src/components/tutor/MessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Send, Paperclip, MoreVertical, X,
  ChevronLeft, ChevronRight, User, Clock, Check, CheckCheck, AlertCircle,
  Plus, Phone, Video, Info, Archive, Trash2
} from 'lucide-react';
import api from '../../services/api';

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [conversations, setConversations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const messagesEndRef = useRef(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch conversations
        console.log('Fetching messages from /v1/tutor/messages');
        const convRes = await api.get('/v1/tutor/messages');
        console.log('Messages response:', convRes);
        
        const conversations = Array.isArray(convRes) ? convRes : (convRes?.data && Array.isArray(convRes.data) ? convRes.data : []);
        setConversations(conversations);
        
        // Fetch students for new message modal
        console.log('Fetching students from /v1/tutor/students');
        const studRes = await api.get('/v1/tutor/students');
        console.log('Students response:', studRes);
        
        const students = Array.isArray(studRes) ? studRes : (studRes?.data && Array.isArray(studRes.data) ? studRes.data : []);
        setStudents(students);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response,
          config: err.config
        });
        setError('Failed to load messages. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const filteredConversations = conversations.filter(conv => {
    const nameMatch = (conv.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const messageMatch = (conv.lastMessage || '').toLowerCase().includes(messageSearch.toLowerCase());
    return nameMatch && messageMatch;
  });

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const currentConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedConversation) {
      alert('Please select a conversation');
      return;
    }

    try {
      const convId = selectedConversation.id || selectedConversation._id;
      if (!convId) {
        console.error('No conversation ID found:', selectedConversation);
        alert('Error: Invalid conversation');
        return;
      }

      const messageToSend = {
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      console.log('Sending message to /v1/tutor/messages/' + convId, messageToSend);

      // Optimistically update UI first
      const updatedConversations = conversations.map(conv => {
        if (conv.id === convId || conv._id === convId) {
          return {
            ...conv,
            lastMessage: messageToSend.text,
            time: 'Just now',
            unread: 0,
            messages: [...(conv.messages || []), {
              id: Date.now(),
              text: messageToSend.text,
              timestamp: messageToSend.timestamp,
              sender: 'tutor',
              read: true
            }]
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      setSelectedConversation(updatedConversations.find(c => c.id === convId || c._id === convId));
      setNewMessage('');

      // Real API call - send just the text
      const response = await api.post(`/v1/tutor/messages/${convId}`, {
        text: messageToSend.text
      });
      console.log('Message sent successfully:', response);
    } catch (err) {
      console.error('Error sending message:', {
        message: err.message,
        status: err.status,
        response: err.response,
        data: err.response?.data
      });
      alert('Failed to send message: ' + (err.message || 'Unknown error'));
    }
  };

  const startNewMessage = async (student) => {
    // Check if conversation already exists
    const existingConv = conversations.find(c =>
      (c.student?.id === student.id || c.student?._id === student._id)
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setShowNewMessageModal(false);
      return;
    }

    try {
      // Create new conversation on backend
      console.log('Creating conversation with student:', student);
      const studentId = student.id || student._id;
      
      if (!studentId) {
        console.error('No student ID found:', student);
        alert('Error: Invalid student');
        return;
      }

      const response = await api.post('/v1/tutor/messages/start', {
        studentId: studentId
      });
      console.log('Conversation created:', response);

      // Use the response data as the new conversation, or create a local one
      const newConv = response || {
        id: studentId,
        _id: studentId,
        student: student,
        lastMessage: '',
        time: 'Now',
        unread: 0,
        messages: []
      };
      
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
    } catch (err) {
      console.error('Error starting conversation:', {
        message: err.message,
        status: err.status,
        response: err.response?.data
      });
      alert('Failed to start conversation: ' + err.message);
    } finally {
      setShowNewMessageModal(false);
    }
  };

  const getStudentsNotInConversation = () => {
    return students.filter(student =>
      !conversations.some(conv =>
        conv.student?.id === student.id || conv.student?._id === student._id
      )
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading messages...</p>
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Messages</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Connect with your students and manage conversations.
          </p>
        </div>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search messages..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  borderColor: 'var(--input-border)'
                }}
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {currentConversations.length > 0 ? (
              currentConversations.map(conv => (
                <div
                  key={conv.id || conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all relative group ${selectedConversation?.id === conv.id || selectedConversation?._id === conv._id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={conv.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.student?.name || 'Student')}&background=random`}
                      alt={conv.student?.name}
                      className="w-10 h-10 rounded-full border-2 object-cover"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                          {conv.student?.name}
                        </h4>
                        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No conversations yet</p>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="text-xs text-blue-600 hover:underline mt-2"
                >
                  Start one now
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 gap-2 text-xs">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors disabled:opacity-50"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <ChevronLeft className="w-3 h-3" />
                Prev
              </button>
              <span style={{ color: 'var(--text-secondary)' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors disabled:opacity-50"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          {selectedConversation ? (
            <div className="flex flex-col h-full rounded-2xl shadow-sm border overflow-hidden"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                maxHeight: '600px'
              }}
            >
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={selectedConversation.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.student?.name || 'Student')}&background=random`}
                    alt={selectedConversation.student?.name}
                    className="w-10 h-10 rounded-full border-2 object-cover"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedConversation.student?.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {selectedConversation.student?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Video call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Info">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {(selectedConversation.messages || []).length > 0 ? (
                  (selectedConversation.messages || []).map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'tutor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex gap-2 max-w-xs">
                        {message.sender !== 'tutor' && (
                          <img
                            src={selectedConversation.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.student?.name || 'Student')}&background=random`}
                            alt={selectedConversation.student?.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl ${message.sender === 'tutor'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                              }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${message.sender === 'tutor' ? 'justify-end' : 'justify-start'}`} style={{ color: 'var(--text-tertiary)' }}>
                            <span>{new Date(message.timestamp || message.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            {message.sender === 'tutor' && (
                              message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Start the conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t flex items-center gap-3"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Attach file">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)',
                    borderColor: 'var(--input-border)'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <MessageSquare className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Select a conversation</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Choose a student from the list to start messaging.</p>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>New Message</h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {getStudentsNotInConversation().length > 0 ? (
                getStudentsNotInConversation().map(student => (
                  <button
                    key={student.id || student._id}
                    onClick={() => startNewMessage(student)}
                    className="w-full p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left border"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=random`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{student.email}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    You've already started conversations with all your students!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;