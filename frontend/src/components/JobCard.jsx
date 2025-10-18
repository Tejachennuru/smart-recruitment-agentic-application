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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-active';
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
    <div className="card-hover group relative overflow-hidden">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-purple transition-all duration-300">
              <span className="text-xl">{getJobIcon(job.job_title)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-dark-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                {job.job_title}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span className={getStatusColor(job.status)}>
                  {job.status || 'active'}
                </span>
                <div className="flex items-center gap-1 text-dark-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{job.candidateCount || 0} applicants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="relative z-10 mb-6">
        <p className="text-dark-600 text-sm leading-relaxed line-clamp-3 group-hover:text-dark-700 transition-colors duration-300">
          {job.description}
        </p>
      </div>

      {/* Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="relative z-10 mb-6">
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="skill-tag group-hover:bg-gradient-to-r group-hover:from-primary-100 group-hover:to-secondary-100 group-hover:text-primary-700 transition-all duration-300"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="relative z-10 border-t border-white/30 pt-6 mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-dark-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Deadline</span>
          </div>
          <span className="font-semibold text-dark-900 text-sm">
            {formatDate(job.application_deadline)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-dark-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium">Positions</span>
          </div>
          <span className="font-semibold text-dark-900 text-sm">
            {job.candidates_needed}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 space-y-3">
        {job.google_form_url && (
          <a
            href={job.google_form_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-glow-green transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Application Form
          </a>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-glow transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
          <button
            onClick={onOpenInterviewee}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-glow-purple transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Interview
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}