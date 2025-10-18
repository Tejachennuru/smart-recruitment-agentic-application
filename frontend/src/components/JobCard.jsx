import React from 'react';

export default function JobCard({ job, onOpenChat, onOpenInterviewee, onRefresh }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {job.job_title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {job.status || 'active'}
            </span>
            <span>•</span>
            <span>{job.candidateCount || 0} applicants</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="border-t border-gray-100 pt-4 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Deadline:</span>
          <span className="font-medium text-gray-900">
            {formatDate(job.application_deadline)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Positions:</span>
          <span className="font-medium text-gray-900">
            {job.candidates_needed}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {job.google_form_url && (
          <a
            href={job.google_form_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
          >
            📋 View Application Form
          </a>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenChat}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium text-sm"
          >
            💬 Chat
          </button>
          <button
            onClick={onOpenInterviewee}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm"
          >
            👥 Interviewer
          </button>
        </div>
      </div>
    </div>
  );
}