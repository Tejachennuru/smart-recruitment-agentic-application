import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import CreateJobModal from './CreateJobModal';
import JobCard from './JobCard';
import ShareDialog from './ShareDialog';
import ChatInterface from './ChatInterface';
import IntervieweeDialog from './IntervieweeDialog';
import ThemeToggle from './ThemeToggle';
import RobotBadge from './RobotBadge';


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
      const { jobs } = await jobsAPI.getAll(); // no .data.data mess
      setJobs(jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
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
      <div className="min-h-screen animated-bg">
        <div className="container mx-auto px-6 py-8">
          <button
            onClick={() => setShowChat(false)}
            className="btn-secondary mb-6 transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </span>
          </button>
          <ChatInterface job={selectedJob} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-200/30 to-secondary-200/30 rounded-full blur-3xl floating"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-accent-200/20 to-primary-200/20 rounded-full blur-3xl floating-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-secondary-200/25 to-accent-200/25 rounded-full blur-3xl floating"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card border-0 shadow-2xl rounded-2xl mt-6 mx-4">
        <div className="container mx-auto px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left section */}
          {/* Left section */}
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-black dark:text-white">
              Smart Recruitment
            </h1>
            <p className="text-xl font-medium text-black dark:text-white">
              Find top talent, faster.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-5 py-2.5 text-white"
              >
                + Create Job
              </button>
              <ThemeToggle />
            </div>
          </div>


          {/* Optional: illustration instead of square icon */}
          <RobotBadge />
        </div>
      </header>


      {/* Stats Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="glass-card rounded-2xl shadow-xl p-6 md:p-7 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow-green">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-1">{jobs.length}</h3>
              <p className="text-black dark:text-white font-medium">Active Job Postings</p>
            </div>

            <div className="glass-card rounded-2xl shadow-xl p-6 md:p-7 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                {jobs.reduce((total, job) => total + (job.candidateCount || 0), 0)}
              </h3>
              <p className="text-black dark:text-white font-medium">Total Applicants</p>
            </div>

            <div className="glass-card rounded-2xl shadow-xl p-6 md:p-7 text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                {jobs.reduce((total, job) => total + (job.candidates_needed || 0), 0)}
              </h3>
              <p className="text-black dark:text-white font-medium">Positions to Fill</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 pb-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary-500 rounded-full animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                ></div>
              </div>
              <p className="text-black dark:text-white font-medium mt-6 text-lg">Loading your job postings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card rounded-2xl shadow-xl p-10 mt-6 text-center space-y-6 mx-auto max-w-2xl">
              <div className="relative">
                <div className="text-7xl mb-2 floating">📋</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-accent-400 to-primary-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-display font-bold text-black dark:text-white">
                Ready to Find Your Next Star?
              </h3>
              <p className="text-black dark:text-white text-lg max-w-md mx-auto">
                Create your first job posting and let our AI help you discover the perfect candidates.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gradient text-lg px-8 py-4 rounded-xl shadow-glow-purple"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Job Posting
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold gradient-text">Your Job Postings</h2>
                <div className="glass px-4 py-2 rounded-xl">
                  <span className="text-black dark:text-white font-medium">{jobs.length} Active Jobs</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {jobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <JobCard
                      job={job}
                      onOpenChat={() => handleOpenChat(job)}
                      onOpenInterviewee={() => handleOpenInterviewee(job)}
                      onRefresh={loadJobs}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
