#!/usr/bin/env node
/**
 * Simple helper script to ingest a local XLSX file using the existing
 * ingestExcelApplications function and then run a RAG question against the
 * provided job id. This bypasses the HTTP API and calls the service functions
 * directly (useful for testing and local runs).
 *
 * Usage:
 *   node scripts/upload_and_ask.js path/to/file.xlsx <jobId> "Your question here"
 *
 * Note: Make sure environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY,
 * GEMINI_API_KEY, etc.) are set in backend/.env or in your environment.
 */

import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import { ingestExcelApplications } from '../src/services/ragIngestService.js';
import { answerWithRag } from '../src/services/ragAgent.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/upload_and_ask.js <xlsxPath> <jobId> <question>');
    process.exit(2);
  }

  const [xlsxPath, jobId, ...qParts] = args;
  const question = qParts.join(' ');

  const resolved = path.resolve(xlsxPath);
  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved);
    process.exit(3);
  }

  console.log('Ingesting file:', resolved, 'for job:', jobId);
  try {
    const result = await ingestExcelApplications(resolved, { defaultJobId: jobId });
    console.log('Ingest result:', result);

    console.log('Running RAG question:', question);
    const response = await answerWithRag({ jobId, question });
    console.log('\n=== RAG Answer ===');
    console.log(response.answer || '(no answer)');
    console.log('\n=== Sources ===');
    console.log(JSON.stringify(response.sources || [], null, 2));
  } catch (err) {
    console.error('Error during ingest or RAG:', err.message || err);
    process.exit(1);
  }
}

main();
