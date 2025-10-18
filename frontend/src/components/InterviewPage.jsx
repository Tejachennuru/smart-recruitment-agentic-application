import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import InterviewReportForm from './InterviewReportForm';

export default function InterviewPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.validateToken(token);
      setData(response.data);
    } catch (err) {
      console.error('Token validation failed:', err);
      setError('Invalid or expired interview link');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmitted = () => {
    setShowReportForm(false);
    setSelectedCandidate(null);
    validateToken(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact HR for a new interview link.
          </p>
        </div>
      </div>
    );
  }

  if (showReportForm && selectedCandidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => {
              setShowReportForm(false);
              setSelectedCandidate(null);
            }}
            className="btn-secondary mb-4"
          >
            ← Back to Candidates
          </button>
          <InterviewReportForm
            token={token}
            candidate={selectedCandidate}
            job={data.job}
            onSuccess={handleReportSubmitted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interview Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {data?.job?.job_title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Interviewer</p>
              <p className="text-sm font-medium text-gray-900">{data?.interviewer}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Job Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-900">{data?.job?.description}</p>
            </div>
            {data?.job?.required_skills && data.job.required_skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.job.required_skills.map((skill, index) => (
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
          </div>
        </div>

        {/* Candidates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Candidates ({data?.candidates?.length || 0})
          </h2>

          {!data?.candidates || data.candidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">No candidates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    {candidate.phone && (
                      <p className="text-sm text-gray-500">{candidate.phone}</p>
                    )}
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.application_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        candidate.application_status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                        candidate.application_status === 'interviewed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {candidate.application_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/candidates/${candidate.id}`}
                      className="btn-secondary text-sm"
                    >
                      View Details
                    </a>
                    {candidate.resume_url && (
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        📄 Resume
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowReportForm(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      📝 Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}