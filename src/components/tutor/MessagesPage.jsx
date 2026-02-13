// src/components/tutor/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Search, Send, Paperclip, MoreVertical,
  ChevronLeft, ChevronRight, User, Clock, Check, CheckCheck, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/messages');
        setConversations(response.data || []);
      } catch (err) {
        setError('Failed to fetch messages. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    (conv.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const currentConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const messageToSend = {
          conversationId: selectedConversation.id,
          text: newMessage.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'tutor'
        };

        // Optimistically update UI
        const updatedConversations = conversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessage: messageToSend.text,
              time: 'Just now',
              messages: [...(conv.messages || []), { ...messageToSend, id: Date.now(), read: true }]
            };
          }
          return conv;
        });
        
        setConversations(updatedConversations);
        setSelectedConversation(updatedConversations.find(c => c.id === selectedConversation.id));
        setNewMessage('');

        // Real API call
        await api.post(`/v1/tutor/messages/${selectedConversation.id}`, { text: messageToSend.text });
      } catch (err) {
        console.error('Failed to send message:', err);
        // Error handling could be added here (e.g., toast notification)
      }
    }
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
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connect with your students and manage conversations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <Send className="w-5 h-5" />
            New Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="relative mb-4">
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

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {currentConversations.length > 0 ? (
              currentConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${selectedConversation?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conv.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.student?.name || 'Student')}&background=random`}
                      alt={conv.student?.name}
                      className="w-12 h-12 rounded-full border-2 object-cover"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {conv.student?.name}
                        </h4>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{conv.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No conversations found.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors disabled:opacity-50"
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors disabled:opacity-50"
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

        <div className="lg:col-span-3">
          {selectedConversation ? (
            <div className="flex flex-col h-150 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.student?.name || 'Student')}&background=random`}
                    alt={selectedConversation.student?.name}
                    className="w-10 h-10 rounded-full border-2 object-cover"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedConversation.student?.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Last seen {selectedConversation.student?.lastSeen || 'recently'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {(selectedConversation.messages || []).map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'tutor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === 'tutor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                        <span>{message.time}</span>
                        {message.sender === 'tutor' && (
                          <div className="flex items-center gap-1">
                            {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex items-center gap-3"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex-1 flex items-center gap-2 p-3 rounded-full"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
                >
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color: 'var(--input-text)' }}
                  />
                </div>
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a student from the list to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;