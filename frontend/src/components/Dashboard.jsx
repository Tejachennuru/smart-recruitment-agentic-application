import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import CreateJobModal from './CreateJobModal';
import JobCard from './JobCard';
import ShareDialog from './ShareDialog';
import ChatInterface from './ChatInterface';
import IntervieweeDialog from './IntervieweeDialog';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showIntervieweeDialog, setShowIntervieweeDialog] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      alert('Failed to load jobs. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = (data) => {
    setShareData(data);
    setShowCreateModal(false);
    setShowShareDialog(true);
    loadJobs();
  };

  const handleOpenChat = (job) => {
    setSelectedJob(job);
    setShowChat(true);
  };

  const handleOpenInterviewee = (job) => {
    setSelectedJob(job);
    setShowIntervieweeDialog(true);
  };

  if (showChat && selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => setShowChat(false)}
            className="btn-secondary mb-4"
          >
            ← Back to Dashboard
          </button>
          <ChatInterface job={selectedJob} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎯 Smart Recruitment Agent
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered recruitment management system
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-lg px-6 py-3"
            >
              + Create Job Posting
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No job postings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first job posting to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Job Posting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpenChat={() => handleOpenChat(job)}
                onOpenInterviewee={() => handleOpenInterviewee(job)}
                onRefresh={loadJobs}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleJobCreated}
        />
      )}

      {showShareDialog && shareData && (
        <ShareDialog
          data={shareData}
          onClose={() => {
            setShowShareDialog(false);
            setShareData(null);
          }}
        />
      )}

      {showIntervieweeDialog && selectedJob && (
        <IntervieweeDialog
          job={selectedJob}
          onClose={() => {
            setShowIntervieweeDialog(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}