import express from 'express';
import { supabase } from '../config/supabase.js';
import { createInterviewToken, validateInterviewToken } from '../services/tokenService.js';
import { sendInterviewInvite } from '../services/emailService.js';
import { requireHRAuth } from '../middleware/auth.js';

const router = express.Router();

// Create interview token and send email
router.post('/token', requireHRAuth, async (req, res) => {
  try {
    const { jobId, interviewerEmail } = req.body;

    if (!jobId || !interviewerEmail) {
      return res.status(400).json({
        success: false,
        error: 'jobId and interviewerEmail are required'
      });
    }

    // Verify job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Create token
    const tokenData = await createInterviewToken(jobId, interviewerEmail);
    const interviewUrl = `${process.env.FRONTEND_URL}/interview/${tokenData.token}`;

    // Send email
    await sendInterviewInvite(interviewerEmail, job.job_title, interviewUrl);

    res.json({
      success: true,
      token: tokenData.token,
      interviewUrl,
      message: 'Interview invite sent successfully'
    });

  } catch (error) {
    console.error('Create interview token error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate token and get interview data
router.get('/validate/:token', async (req, res) => {
  try {
    const tokenData = await validateInterviewToken(req.params.token);

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get candidates for this job
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', tokenData.job_id)
      .order('applied_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      job: tokenData.jobs,
      candidates: candidates || [],
      interviewer: tokenData.interviewer_email
    });

  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit interview report
router.post('/report', async (req, res) => {
  try {
    const {
      token,
      candidateId,
      interviewRound,
      technicalSkillsRating,
      communicationRating,
      culturalFitRating,
      overallRecommendation,
      strengths,
      weaknesses,
      detailedFeedback,
      followUpQuestions
    } = req.body;

    // Validate token
    const tokenData = await validateInterviewToken(token);
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Verify candidate belongs to this job
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .eq('job_id', tokenData.job_id)
      .single();

    if (candidateError || !candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Save report
    const { data: report, error: reportError } = await supabase
      .from('interview_reports')
      .insert({
        candidate_id: candidateId,
        job_id: tokenData.job_id,
        interviewer_email: tokenData.interviewer_email,
        interview_round: interviewRound,
        technical_skills_rating: technicalSkillsRating,
        communication_rating: communicationRating,
        cultural_fit_rating: culturalFitRating,
        overall_recommendation: overallRecommendation,
        strengths,
        weaknesses,
        detailed_feedback: detailedFeedback,
        follow_up_questions: followUpQuestions
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // TODO: Send report to RAG pipeline for analysis
    console.log('[TODO] Send interview report to RAG pipeline:', report.id);

    res.json({
      success: true,
      report,
      message: 'Interview report submitted successfully'
    });

  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get reports for a candidate
router.get('/reports/:candidateId', requireHRAuth, async (req, res) => {
  try {
    const { data: reports, error } = await supabase
      .from('interview_reports')
      .select('*')
      .eq('candidate_id', req.params.candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      reports: reports || []
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;