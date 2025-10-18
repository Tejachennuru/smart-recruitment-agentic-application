RAG ingestion & test helper
===========================

This page explains how to ingest an XLSX/CSV or Google Sheet into the
`application_chunks` table and test RAG question answering locally.

Required environment variables (set in backend/.env or process env):

- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- GEMINI_API_KEY
- (optional) GEMINI_EMBEDDING_URL
- VECTOR_DIM (default 1536)

1) Ingest an XLSX locally and ask a question (script)

Usage (PowerShell):

From the repository root run:

    cd .\backend
    node .\scripts\upload_and_ask.js C:\path\to\applications.xlsx 95b3b718-a17d-4d8a-a7aa-c497bb7ce8be "Which applicants have Python experience?"

The script will:
- Read rows from the XLSX
- Create `content` for each row
- Compute embeddings via Gemini adapter
- Insert rows to `application_chunks`
- Run a RAG question through `answerWithRag` and print the answer + sources

2) Upload XLSX via HTTP endpoint (multipart form-data)

The backend provides an endpoint for uploads: POST /api/rag/upload/:jobId
Example using curl (PowerShell):

    $jobId = '95b3b718-a17d-4d8a-a7aa-c497bb7ce8be'
    $file = 'C:\path\to\applications.xlsx'
    curl -X POST "http://localhost:3000/api/rag/upload/$jobId" -H "Authorization: Bearer YOUR_HR_TOKEN" -F "file=@$file"

Or use Postman to upload the file as form-data `file` field.

3) Ingest Google Sheet via CSV export URL

If you can make the sheet viewable by link, use the CSV export URL pattern:

    https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}

Then call the backend route:

POST /api/rag/upload-gsheet/:jobId
Body JSON: { "csvUrl": "https://...export?format=csv&gid=..." }

PowerShell example:

    $csvUrl = 'https://docs.google.com/spreadsheets/d/1GSnIcQuUmukM_hTDIWqny0jHFViqrysHgdlBkvTBqts/export?format=csv&gid=1304692303'
    $jobId = '95b3b718-a17d-4d8a-a7aa-c497bb7ce8be'
    Invoke-RestMethod -Uri "http://localhost:3000/api/rag/upload-gsheet/$jobId" -Method Post -Body (@{ csvUrl = $csvUrl } | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = 'Bearer YOUR_HR_TOKEN' }

If the sheet is private, you'll get a 403 from Google when the server attempts to download it — use option 1 (upload XLSX) or implement a service-account fetch.

4) Troubleshooting

- If ingestion logs show "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY" set env vars in backend/.env.
- If embedding fails, ensure GEMINI_API_KEY is set and GEMINI_EMBEDDING_URL (if used) is correct.
- Check Supabase table `application_chunks` to verify rows and embeddings.

If you'd like, I can:
- Add a Google Sheets API authenticated ingestion flow (service account)
- Add an HTTP endpoint that accepts a Google service account token for private-sheet ingestion

Appendix: example backend/.env

Create a file `backend/.env` with the following values (replace placeholders):

    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    GEMINI_API_KEY=ya29.your_gemini_key
    GEMINI_EMBEDDING_URL= (optional) leave blank to use default
    VECTOR_DIM=1536

Keep your service key secret. After creating `.env`, restart your backend or re-run the script.
