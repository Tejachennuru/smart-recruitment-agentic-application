import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import crypto from 'crypto';
import axios from 'axios';
import { supabaseAdmin } from '../config/supabase.js';
import { GeminiEmbeddings } from './geminiEmbeddings.js';

// Assumptions:
// - Excel file has columns like: Job ID, Applicant Name, Applicant Email, Phone, Resume, Cover Letter, Skills, Experience, Notes
// - We'll concatenate relevant fields into a single content string per row

const REQUIRED_ENV = ['GEMINI_API_KEY'];

export function verifyRagEnv() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

function normalizeEmbedding(vec, dim = 1536) {
  const out = new Array(dim).fill(0);
  const n = Math.min(dim, (vec?.length) || 0);
  for (let i = 0; i < n; i++) out[i] = vec[i];
  return out;
}

// Use the shared GeminiEmbeddings adapter so URL construction and API calls
// are implemented consistently across the codebase.
const embeddingsClient = new GeminiEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  embeddingUrl: process.env.GEMINI_EMBEDDING_URL,
  targetDim: process.env.VECTOR_DIM || 768, // Changed default to 768 for text-embedding-004
});

function rowToContent(row) {
  const pairs = Object.entries(row)
    .filter(([k, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`);
  return pairs.join('\n');
}

// Helper function to safely extract error details
function getErrorDetails(error) {
  const details = {
    message: error.message || 'Unknown error',
  };

  // Add response data if it's an axios error
  if (error.response) {
    details.status = error.response.status;
    details.statusText = error.response.statusText;
    details.data = error.response.data;
  }

  // Add request info if available
  if (error.config) {
    details.url = error.config.url;
    details.method = error.config.method;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    details.stack = error.stack;
  }

  return details;
}

export async function ingestExcelApplications(filePath, { defaultJobId, allowDuplicates = false } = {}) {
  verifyRagEnv();
  
  try {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return { inserted: 0, skipped: 0, message: 'No rows found in file' };
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        // Normalize common headers in a forgiving way
        const norm = (key) => Object.keys(row).find((k) => k.toLowerCase().includes(key));
        const jobIdKey = norm('job') || norm('job id');
        const emailKey = norm('email');
        const nameKey = norm('name');

        const job_id = (jobIdKey ? String(row[jobIdKey]).trim() : null) || defaultJobId || null;
        const applicant_email = emailKey ? String(row[emailKey]).trim() : null;
        const applicant_name = nameKey ? String(row[nameKey]).trim() : null;

        if (!job_id) {
          console.warn('Skipping row due to missing job_id:', row);
          skipped += 1;
          errors.push({ row, reason: 'Missing job_id' });
          continue;
        }

        const content = rowToContent(row);
        if (!content.trim()) {
          console.warn('Skipping row due to empty content:', row);
          skipped += 1;
          errors.push({ row, reason: 'Empty content' });
          continue;
        }

        // Check for duplicates if not allowed
        if (!allowDuplicates && applicant_email) {
          const { data: existing } = await supabaseAdmin
            .from('application_chunks')
            .select('id')
            .eq('job_id', job_id)
            .eq('applicant_email', applicant_email)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`Skipping duplicate applicant: ${applicant_email}`);
            skipped += 1;
            errors.push({ row, reason: 'Duplicate applicant' });
            continue;
          }
        }

        // Generate embedding
        const embedding = await embeddingsClient.embedQuery(content);
        
        // Insert into database
        const { error: insertError } = await supabaseAdmin
          .from('application_chunks')
          .insert({
            job_id,
            applicant_email,
            applicant_name,
            content,
            metadata: { 
              source: path.basename(filePath), 
              sheet: sheetName,
              applicant_email,
              applicant_name,
            },
            embedding,
          });

        if (insertError) {
          throw insertError;
        }

        inserted += 1;
        console.log(`✓ Inserted applicant: ${applicant_name || applicant_email || 'Unknown'}`);

      } catch (rowError) {
        const errorDetails = getErrorDetails(rowError);
        console.error('Failed to insert row:', errorDetails);
        console.error('Row data:', row);
        skipped += 1;
        errors.push({ 
          row: { 
            name: row[Object.keys(row).find((k) => k.toLowerCase().includes('name'))],
            email: row[Object.keys(row).find((k) => k.toLowerCase().includes('email'))]
          }, 
          error: errorDetails 
        });
      }
    }

    const result = { 
      inserted, 
      skipped, 
      total: rows.length,
      message: `Successfully inserted ${inserted} out of ${rows.length} applications`
    };

    if (errors.length > 0 && process.env.NODE_ENV === 'development') {
      result.errors = errors.slice(0, 5); // Only include first 5 errors to avoid huge responses
    }

    return result;

  } catch (error) {
    const errorDetails = getErrorDetails(error);
    console.error('Excel ingestion error:', errorDetails);
    throw new Error(`Failed to ingest Excel file: ${errorDetails.message}`);
  }
}

// CSV ingestion: parse via XLSX (it supports csv) by extension
export async function ingestCSVApplications(filePath, opts) {
  return ingestExcelApplications(filePath, opts);
}

// Google Sheets ingestion via public CSV export URL or API
// Example: https://docs.google.com/spreadsheets/d/{sheetId}/export?format=csv
export async function ingestGoogleSheetByCsvUrl(csvUrl, { defaultJobId } = {}) {
  verifyRagEnv();
  const tmpPath = path.join(process.cwd(), 'uploads', `sheet-${Date.now()}.csv`);
  
  try {
    const resp = await axios.get(csvUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tmpPath, Buffer.from(resp.data));
    return await ingestCSVApplications(tmpPath, { defaultJobId });
  } catch (error) {
    const errorDetails = getErrorDetails(error);
    console.error('Google Sheet ingestion error:', errorDetails);
    throw new Error(`Failed to ingest Google Sheet: ${errorDetails.message}`);
  } finally {
    try { 
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath); 
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', tmpPath);
    }
  }
}