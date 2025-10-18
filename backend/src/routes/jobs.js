import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { createGoogleForm, indexJobDataForRAG } from '../services/mcpClient.js';
import { generateWhatsAppMessage, generateJobSummary } from '../utils/messageTemplates.js';
import { requireHRAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * CREATE job
 * POST /api/jobs
 */
router.post('/', requireHRAuth, async (req, res) => {
  try {
    const {
      job_title,
      description,
      qualifications,
      required_skills,
      application_deadline,
      candidates_needed,
      contact_email,
      additional_notes,
    } = req.body;

    if (!job_title || !description || !contact_email) {
      return res.status(400).json({
        success: false,
        error: 'job_title, description, and contact_email are required',
      });
    }

    // 1) Create Google Form via MCP
    let formResult;
    try {
      formResult = await createGoogleForm(req.body);
    } catch (formError) {
      console.error('Form creation failed:', formError);
      return res.status(500).json({
        success: false,
        error: `Failed to create application form: ${formError.message}`,
      });
    }

    // 2) Save job in DB (service role)
    const { data: job, error: dbError } = await supabaseAdmin
      .from('jobs')
      .insert({
        job_title,
        description,
        qualifications,
        required_skills: required_skills || [],
        application_deadline,
        candidates_needed: candidates_needed || 1,
        contact_email,
        additional_notes,
        google_form_url: formResult.formUrl,
        google_form_id: formResult.formId,
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: `Database error: ${dbError.message}`,
      });
    }

    // 3) WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(job_title, formResult.formUrl);

    // 4) Index for RAG (best-effort)
    try {
      await indexJobDataForRAG(job.id, job);
    } catch (ragError) {
      console.error('RAG indexing failed (non-critical):', ragError);
    }

    return res.status(201).json({
      success: true,
      job: { ...job, summary: generateJobSummary(job) },
      googleForm: { url: formResult.formUrl, id: formResult.formId },
      whatsappMessage,
    });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * LIST jobs
 * GET /api/jobs
 * NOTE: If you get 401s from the frontend, temporarily remove `requireHRAuth`.
 */
router.get('/', async (_req, res) => {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*, candidates(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      jobs: (jobs || []).map((job) => ({
        ...job,
        candidateCount: job.candidates?.[0]?.count || 0,
      })),
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET one job
 * GET /api/jobs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*, candidates(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.json({ success: true, job });
  } catch (error) {
    console.error('Get job error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * UPDATE job
 * PATCH /api/jobs/:id
 */
router.patch('/:id', requireHRAuth, async (req, res) => {
  try {
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE job
 * DELETE /api/jobs/:id
 */
router.delete('/:id', requireHRAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('jobs').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
