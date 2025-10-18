import React, { useState } from 'react';
import { interviewAPI } from '../services/api';

export default function InterviewReportForm({ token, candidate, job, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewRound: 'Technical Round 1',
    technicalSkillsRating: 5,
    communicationRating: 5,
    culturalFitRating: 5,
    overallRecommendation: 'proceed',
    strengths: '',
    weaknesses: '',
    detailedFeedback: '',
    followUpQuestions: ''
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

    try {
      setLoading(true);
      await interviewAPI.submitReport({
        token,
        candidateId: candidate.id,
        ...formData
      });
      alert('Interview report submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert(`Failed to submit report: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          Interview Report
        </h2>
        <p className="text-gray-600 mt-1">
          <strong>{candidate.name}</strong> - {job.job_title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Interview Round */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Round
          </label>
          <select
            name="interviewRound"
            value={formData.interviewRound}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="Phone Screening">Phone Screening</option>
            <option value="Technical Round 1">Technical Round 1</option>
            <option value="Technical Round 2">Technical Round 2</option>
            <option value="Behavioral Interview">Behavioral Interview</option>
            <option value="Final Round">Final Round</option>
            <option value="HR Round">HR Round</option>
          </select>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills (1-10)
            </label>
            <input
              type="number"
              name="technicalSkillsRating"
              value={formData.technicalSkillsRating}
              onChange={handleChange}
              min="1"
              max="10"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication (1-10)
            </label>
            <input
              type="number"
              name="communicationRating"
              value={formData.communicationRating}
              onChange={handleChange}
              min="1"
              max="10"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cultural Fit (1-10)
            </label>
            <input
              type="number"
              name="culturalFitRating"
              value={formData.culturalFitRating}
              onChange={handleChange}
              min="1"
              max="10"
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Overall Recommendation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Recommendation
          </label>
          <select
            name="overallRecommendation"
            value={formData.overallRecommendation}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="strong_yes">Strong Yes - Highly Recommend</option>
            <option value="yes">Yes - Recommend</option>
            <option value="maybe">Maybe - Proceed with Caution</option>
            <option value="no">No - Do Not Proceed</option>
            <option value="strong_no">Strong No - Definitely Not</option>
          </select>
        </div>

        {/* Strengths */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strengths
          </label>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            placeholder="What did the candidate excel at?"
            rows="3"
            className="input-field"
          />
        </div>

        {/* Weaknesses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas for Improvement
          </label>
          <textarea
            name="weaknesses"
            value={formData.weaknesses}
            onChange={handleChange}
            placeholder="What areas could the candidate improve upon?"
            rows="3"
            className="input-field"
          />
        </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Detailed Feedback
      </label>
      <textarea
        name="detailedFeedback"
        value={formData.detailedFeedback}
        onChange={handleChange}
        placeholder="Provide comprehensive feedback about the interview, specific questions asked, and responses..."
        rows="6"
        className="input-field"
        required
      />
    </div>

    {/* Follow-up Questions */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Follow-up Questions/Notes
      </label>
      <textarea
        name="followUpQuestions"
        value={formData.followUpQuestions}
        onChange={handleChange}
        placeholder="Any questions for future rounds or additional notes..."
        rows="3"
        className="input-field"
      />
    </div>

    {/* TODO Note */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-sm text-yellow-800">
        <strong>TODO:</strong> After submission, this report will be sent to the RAG pipeline for:
        <ul className="list-disc ml-4 mt-2 space-y-1">
          <li>Analysis and pattern recognition across all interviews</li>
          <li>Candidate ranking and comparison</li>
          <li>AI-generated insights and recommendations</li>
          <li>Integration with chat assistant for HR queries</li>
        </ul>
      </p>
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={() => window.history.back()}
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
            Submitting...
          </>
        ) : (
          '✓ Submit Report'
        )}
      </button>
    </div>
  </form>
</div>
  );
}