# RAG Agent (Excel Applications)

This backend adds a Retrieval-Augmented Generation (RAG) pipeline that:
- Ingests applicant data from Excel (.xlsx)
- Embeds and stores chunks in Supabase (Postgres + pgvector)
- Answers questions per job using a retriever + OpenAI chat model

## Requirements
- Supabase database with pgvector extension enabled
- Backend env vars:
  - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (already used)
  - `OPENAI_API_KEY`
  - Optional: `OPENAI_MODEL` (default: gpt-4o-mini)
  - Optional: `OPENAI_EMBEDDING_MODEL` (default: text-embedding-3-small)

## Database setup
Apply the changes in `database/schema.sql` (pgvector extension, `application_chunks` table, and RPC `match_application_chunks`). You can run the SQL file in Supabase SQL editor.

## Endpoints
- `POST /api/rag/upload/:jobId` with form-data `file`: Upload an Excel and ingest rows.
- `POST /api/rag/ask/:jobId` with JSON `{ "question": "..." }`: Ask a question; returns `answer` and `sources`.

Both are protected by the existing `requireHRAuth` middleware.

## Excel format
The ingestor is forgiving with headers. If present, it will look for columns containing:
- job id ("job" or "job id")
- applicant name ("name")
- applicant email ("email")

All cells in a row are concatenated into one text block and embedded.

## Notes
- For best retrieval, ensure the Excel contains a `job id` column matching your `jobs.id` UUIDs. If the Excel does not have a job id column, the `:jobId` param passed to the upload route will be used.
- Rows without any job id (neither in the sheet nor provided) are skipped.
- You can re-upload to add more rows; consider deduplication strategies later (e.g., unique on job_id+email+hash).

## Future improvements
- Dedupe rows by content hash
- Support CSV and Google Sheets ingestion
- Richer metadata, per-field chunking, and better prompts
- Add feedback capture and re-ranking
