import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

export default function ChatInterface({ job }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [job.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await chatAPI.getHistory(job.id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(job.id, userMessage);
      setMessages(prev => [
        ...prev,
        response.data.userMessage,
        response.data.assistantMessage
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getJobIcon = (title) => {
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('developer') || titleLower.includes('engineer')) return '💻';
    if (titleLower.includes('designer')) return '🎨';
    if (titleLower.includes('manager')) return '👔';
    if (titleLower.includes('analyst')) return '📊';
    if (titleLower.includes('marketing')) return '📈';
    if (titleLower.includes('sales')) return '💼';
    return '🎯';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-180px)]">
      {/* Context Panel */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-xl">{getJobIcon(job.job_title)}</span>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold gradient-text">Job Context</h2>
            <p className="text-sm text-dark-500">AI Assistant</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass p-4 rounded-xl">
            <h3 className="font-display font-bold text-dark-900 mb-2">{job.job_title}</h3>
            <p className="text-sm text-dark-600 leading-relaxed">{job.description}</p>
          </div>

          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h4 className="font-display font-semibold text-dark-700 mb-3 text-sm">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="skill-tag"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass p-4 rounded-xl space-y-3">
            <h4 className="font-display font-semibold text-dark-700 text-sm mb-3">Job Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-dark-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Applicants</span>
                </div>
                <span className="font-semibold text-dark-900">{job.candidates?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-dark-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Positions</span>
                </div>
                <span className="font-semibold text-dark-900">{job.candidates_needed}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-dark-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Status</span>
                </div>
                <span className="status-active text-xs">
                  {job.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚀</span>
              <h4 className="font-display font-semibold text-dark-700 text-sm">AI Features</h4>
            </div>
            <p className="text-xs text-dark-600 mb-3">
              Enhanced with intelligent capabilities:
            </p>
            <ul className="text-xs text-dark-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Semantic candidate search
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                Interview analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                Skill matching
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                AI insights
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-3 glass-card rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text">AI Assistant</h2>
              <p className="text-dark-600 mt-1">
                Ask questions about candidates, requirements, or get recommendations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-dark-500 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-dark-600 font-medium">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative mb-8">
                <div className="text-8xl floating">💭</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-display font-bold text-dark-900 mb-4">
                Start a Conversation
              </h3>
              <p className="text-dark-600 text-lg mb-8 max-w-md">
                Ask me anything about this job posting, candidates, or get AI-powered recommendations
              </p>
              <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                <button
                  onClick={() => setInput('How many candidates have applied?')}
                  className="text-left px-6 py-4 glass hover:shadow-lg rounded-xl text-dark-700 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💼</span>
                    <span className="font-medium">How many candidates have applied?</span>
                  </div>
                </button>
                <button
                  onClick={() => setInput('What skills are most common among applicants?')}
                  className="text-left px-6 py-4 glass hover:shadow-lg rounded-xl text-dark-700 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <span className="font-medium">What skills are most common among applicants?</span>
                  </div>
                </button>
                <button
                  onClick={() => setInput('Summarize the interview reports')}
                  className="text-left px-6 py-4 glass hover:shadow-lg rounded-xl text-dark-700 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span className="font-medium">Summarize the interview reports</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-sm">🤖</span>
                        </div>
                        <span className="text-sm font-medium text-dark-600">AI Assistant</span>
                      </div>
                    )}
                    <div
                      className={`px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'message-user'
                          : 'message-assistant'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-3 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    <span className="text-sm font-medium text-dark-600">AI Assistant</span>
                  </div>
                  <div className="message-assistant">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-6 border-t border-white/30">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this job posting..."
                className="input-field pr-12"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary px-8 shadow-glow hover:shadow-glow-purple"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </div>
              )}
            </button>
          </div>
          <p className="text-xs text-dark-500 mt-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}