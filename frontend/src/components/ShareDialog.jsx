import React, { useState } from 'react';

export default function ShareDialog({ data, onClose }) {
  const [copied, setCopied] = useState(false);

  const formUrl = data?.googleForm?.url || '';
  const whatsappMessage = data?.whatsappMessage || '';
  const job = data?.job || {};

  const handleCopy = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content max-w-3xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            ✅ Job Posted Successfully!
          </h2>
          <p className="text-gray-600 mt-1">
            Your job posting and application form are ready to share
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Form Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Application Form Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formUrl}
                readOnly
                className="input-field flex-1 bg-gray-50"
              />
              <button
                onClick={() => {
                  if (formUrl) {
                    navigator.clipboard.writeText(formUrl);
                    alert('Form link copied!');
                  }
                }}
                className="btn-secondary"
              >
                Copy
              </button>
              {formUrl && (
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Open
                </a>
              )}
            </div>
          </div>

          {/* WhatsApp Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💬 WhatsApp Message Template
            </label>
            <div className="relative">
              <textarea
                value={whatsappMessage}
                readOnly
                rows="8"
                className="input-field bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Job Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Job Summary
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {job.job_title || 'Untitled Job'}
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {job.description || 'No description available.'}
                </p>
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-gray-700 mb-1">
                      Required Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
