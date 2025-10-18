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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      {/* Context Panel */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Job Context</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">{job.job_title}</h3>
            <p className="text-sm text-gray-600">{job.description}</p>
          </div>

          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Applicants:</span>
              <span className="font-medium">{job.candidates?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Positions:</span>
              <span className="font-medium">{job.candidates_needed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {job.status}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>TODO:</strong> RAG Integration - This chat will be enhanced with:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Semantic search across candidate profiles</li>
                <li>Interview report analysis</li>
                <li>Skill matching recommendations</li>
                <li>AI-powered candidate insights</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">💬 Chat Assistant</h2>
          <p className="text-sm text-gray-600">
            Ask questions about candidates, requirements, or get recommendations
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm text-center max-w-md">
                Ask me anything about this job posting, candidates, or get AI-powered recommendations
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-md">
                <button
                  onClick={() => setInput('How many candidates have applied?')}
                  className="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  💼 How many candidates have applied?
                </button>
                <button
                  onClick={() => setInput('What skills are most common among applicants?')}
                  className="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  🎯 What skills are most common among applicants?
                </button>
                <button
                  onClick={() => setInput('Summarize the interview reports')}
                  className="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  📊 Summarize the interview reports
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about this job posting..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary px-6"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}