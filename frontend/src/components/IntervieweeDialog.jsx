import React, { useState } from 'react';
import { interviewAPI } from '../services/api';

export default function IntervieweeDialog({ job, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [interviewUrl, setInterviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await interviewAPI.createToken(job.id, email);
      setInterviewUrl(response.data.interviewUrl);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to create interview token:', error);
      alert(`Failed to send invite: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            👥 Invite Interviewer
          </h2>
          <p className="text-gray-600 mt-1">
            Send interview access for: <strong>{job.job_title}</strong>
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interviewer Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="interviewer@company.com"
                className="input-field"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                An email will be sent with a secure link to access the interview dashboard
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                What the interviewer will be able to do:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>View all candidates for this position</li>
                <li>Review candidate applications</li>
                <li>Submit detailed interview reports</li>
                <li>Rate candidates on multiple criteria</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  '✉️ Send Invite'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Invite Sent Successfully!
              </h3>
              <p className="text-gray-600">
                An email has been sent to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Access Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interviewUrl}
                  readOnly
                  className="input-field flex-1 bg-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(interviewUrl);
                    alert('Link copied!');
                  }}
                  className="btn-secondary"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This link is valid for 30 days
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}