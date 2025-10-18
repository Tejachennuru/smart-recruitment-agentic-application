import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireHRAuth } from '../middleware/auth.js';
import { ingestExcelApplications, ingestCSVApplications, ingestGoogleSheetByCsvUrl } from '../services/ragIngestService.js';
import { answerWithRag } from '../services/ragAgent.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// Helper function to format error responses
function formatError(error) {
  const response = {
    success: false,
    error: error.message || 'An unknown error occurred',
  };

  // Add more details in development
  if (process.env.NODE_ENV === 'development') {
    if (error.response) {
      response.apiError = {
        status: error.response.status,
        data: error.response.data,
      };
    }
    if (error.stack) {
      response.stack = error.stack.split('\n').slice(0, 5).join('\n');
    }
  }

  return response;
}

// Upload Excel and ingest into vector store
router.post('/upload/:jobId', requireHRAuth, upload.single('file'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { allowDuplicates } = req.query;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log(`📤 Starting upload for job ${jobId}, file: ${req.file.originalname}`);

    const result = await ingestExcelApplications(req.file.path, {
      defaultJobId: jobId,
      allowDuplicates: allowDuplicates === 'true',
    });

    console.log(`✅ Upload complete: ${result.inserted} inserted, ${result.skipped} skipped`);

    res.json({ 
      success: true, 
      jobId, 
      ...result 
    });

  } catch (error) {
    console.error('❌ RAG upload error:', error);
    res.status(500).json(formatError(error));
  } finally {
    // Cleanup uploaded file
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', req.file.path);
      }
    }
  }
});

// Ask a RAG question for a given job
router.post('/ask/:jobId', requireHRAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ 
        success: false, 
        error: 'question is required' 
      });
    }

    console.log(`💬 RAG query for job ${jobId}: ${question}`);

    const response = await answerWithRag({ jobId, question });

    // Save to chat history too (so UI stays in sync), with sources in metadata
    const { data: userMessage } = await supabaseAdmin
      .from('chat_messages')
      .insert({ 
        job_id: jobId, 
        role: 'user', 
        content: question 
      })
      .select()
      .single();

    const { data: assistantMessage } = await supabaseAdmin
      .from('chat_messages')
      .insert({ 
        job_id: jobId, 
        role: 'assistant', 
        content: response.answer, 
        metadata: { 
          sources: response.sources, 
          model: process.env.OPENAI_MODEL || 'gemini-1.5-flash' 
        } 
      })
      .select()
      .single();

    res.json({ 
      success: true, 
      ...response, 
      userMessage, 
      assistantMessage 
    });

  } catch (error) {
    console.error('❌ RAG ask error:', error);
    res.status(500).json(formatError(error));
  }
});

// Ingest CSV file
router.post('/upload-csv/:jobId', requireHRAuth, upload.single('file'), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log(`📄 Starting CSV upload for job ${jobId}`);

    const result = await ingestCSVApplications(req.file.path, { 
      defaultJobId: jobId 
    });

    console.log(`✅ CSV upload complete: ${result.inserted} inserted, ${result.skipped} skipped`);

    res.json({ 
      success: true, 
      jobId, 
      ...result 
    });

  } catch (error) {
    console.error('❌ RAG CSV upload error:', error);
    res.status(500).json(formatError(error));
  } finally {
    // Cleanup uploaded file
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', req.file.path);
      }
    }
  }
});

// Ingest Google Sheet via CSV export URL
router.post('/upload-gsheet/:jobId', requireHRAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { csvUrl } = req.body;
    
    if (!csvUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'csvUrl is required' 
      });
    }

    console.log(`📊 Starting Google Sheet ingest for job ${jobId}`);

    const result = await ingestGoogleSheetByCsvUrl(csvUrl, { 
      defaultJobId: jobId 
    });

    console.log(`✅ Google Sheet ingest complete: ${result.inserted} inserted, ${result.skipped} skipped`);

    res.json({ 
      success: true, 
      jobId, 
      ...result 
    });

  } catch (error) {
    console.error('❌ RAG GSheet ingest error:', error);
    res.status(500).json(formatError(error));
  }
});

// Feedback endpoint
router.post('/feedback/:jobId', requireHRAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { question, answer, helpful, rating, notes, sources } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: 'question and answer are required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('rag_feedback')
      .insert({ 
        job_id: jobId, 
        question, 
        answer, 
        helpful, 
        rating, 
        notes, 
        sources 
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      feedback: data 
    });

  } catch (error) {
    console.error('❌ RAG feedback error:', error);
    res.status(500).json(formatError(error));
  }
});

export default router;