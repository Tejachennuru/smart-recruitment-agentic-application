import React, { useState } from 'react';
import { jobsAPI } from '../services/api';

export default function CreateJobModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    description: '',
    qualifications: '',
    required_skills: '',
    application_deadline: '',
    candidates_needed: 1,
    contact_email: '',
    additional_notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.job_title || !formData.description || !formData.contact_email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Convert comma-separated skills to array
      const payload = {
        ...formData,
        required_skills: formData.required_skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
        candidates_needed: parseInt(formData.candidates_needed) || 1
      };

      const response = await jobsAPI.create(payload); // returns { success, job, googleForm, whatsappMessage }
      onSuccess(response.job); // pass the job back to parent
    } catch (error) {
      console.error('Failed to create job:', error);
      alert(`Failed to create job: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Job Posting
          </h2>
          <p className="text-gray-600 mt-1">
            Fill in the details below. A Google Form will be automatically created.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="e.g., Senior Full Stack Developer"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows="4"
              className="input-field"
              required
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualifications
            </label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="Required education, certifications, years of experience..."
              rows="3"
              className="input-field"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills
            </label>
            <input
              type="text"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python, AWS (comma-separated)"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter skills separated by commas
            </p>
          </div>

          {/* Grid for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                type="datetime-local"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Candidates Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidates Needed
              </label>
              <input
                type="number"
                name="candidates_needed"
                value={formData.candidates_needed}
                onChange={handleChange}
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="hr@company.com"
              className="input-field"
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="Any other information for candidates..."
              rows="2"
              className="input-field"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                  Creating...
                </>
              ) : (
                '✓ Create Job & Form'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}