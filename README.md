# 🤖 Smart Recruitment Agent

An AI-powered recruitment platform that uses RAG (Retrieval-Augmented Generation) to help HR teams analyze job applications, conduct intelligent searches, and make data-driven hiring decisions.

## ✨ Features

### 🎯 Core Functionality
- **RAG-Powered Chat**: Ask questions about candidates using natural language
- **Smart Application Analysis**: Upload Excel/CSV files with candidate data
- **Vector Search**: Semantic search across all applications using embeddings
- **Multi-Format Support**: Excel (.xlsx), CSV, and Google Sheets integration
- **Real-time Chat Interface**: Interactive Q&A about candidates and applications

### 🔍 Key Capabilities
- Find candidates by skills, experience, or qualifications
- Compare multiple candidates
- Get AI-powered recommendations
- Analyze candidate fit for job requirements
- Track application history and feedback

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│   Backend API    │────────▶│   Supabase      │
│   (React)       │         │   (Express.js)   │         │   (PostgreSQL)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │                            │
                                     │                            │
                                     ▼                            ▼
                            ┌──────────────────┐         ┌─────────────────┐
                            │   Gemini API     │         │  Vector Store   │
                            │   - Embeddings   │         │  (pgvector)     │
                            │   - Chat         │         └─────────────────┘
                            └──────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works)
- **Google Gemini API** key (free tier available)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-recruitment-agent
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Server
PORT=3001
NODE_ENV=development

# Security
HR_TOKEN=your_secure_random_token_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Frontend/Backend URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
VECTOR_DIM=768

# Email (SMTP) - Optional
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password
```

#### Setup Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title text NOT NULL,
  description text,
  requirements jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create application_chunks table for RAG
CREATE TABLE application_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_email varchar(255),
  applicant_name varchar(255),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(768) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX application_chunks_job_id_idx ON application_chunks(job_id);
CREATE INDEX application_chunks_applicant_email_idx ON application_chunks(applicant_email);
CREATE INDEX application_chunks_embedding_idx ON application_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create vector search function
CREATE OR REPLACE FUNCTION match_application_chunks(
  query_embedding vector(768),
  match_count integer DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  job_id uuid,
  applicant_email text,
  applicant_name text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  filter_job_id uuid;
BEGIN
  filter_job_id := CASE 
    WHEN filter->>'job_id' IS NOT NULL 
    THEN (filter->>'job_id')::uuid
    ELSE NULL
  END;

  RETURN QUERY
  SELECT
    ac.id,
    ac.job_id,
    ac.applicant_email::text,
    ac.applicant_name::text,
    ac.content,
    ac.metadata,
    (1 - (ac.embedding <=> query_embedding))::float as similarity
  FROM application_chunks ac
  WHERE 
    CASE 
      WHEN filter_job_id IS NOT NULL 
      THEN ac.job_id = filter_job_id
      ELSE TRUE
    END
  ORDER BY ac.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX chat_messages_job_id_idx ON chat_messages(job_id);

-- Create feedback table
CREATE TABLE IF NOT EXISTS rag_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  helpful boolean,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  sources jsonb,
  created_at timestamptz DEFAULT now()
);
```

#### Start the Backend

```bash
npm start
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
VITE_API_URL=http://localhost:3001
VITE_HR_TOKEN=your_secure_random_token_here
```

#### Start the Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📚 API Documentation

### RAG Endpoints

#### Upload Applications

```bash
POST /api/rag/upload/:jobId
Content-Type: multipart/form-data
Authorization: Bearer YOUR_HR_TOKEN

Body:
- file: Excel/CSV file with application data
- allowDuplicates: true/false (query parameter)
```

#### Ask Questions

```bash
POST /api/rag/ask/:jobId
Content-Type: application/json
Authorization: Bearer YOUR_HR_TOKEN

Body:
{
  "question": "How many candidates have applied?"
}

Response:
{
  "success": true,
  "answer": "Based on the applications...",
  "sources": [
    {
      "applicant_name": "John Doe",
      "applicant_email": "john@example.com",
      "snippet": "..."
    }
  ]
}
```

#### Upload Google Sheet

```bash
POST /api/rag/upload-gsheet/:jobId
Content-Type: application/json
Authorization: Bearer YOUR_HR_TOKEN

Body:
{
  "csvUrl": "https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv"
}
```

### Chat Endpoints

#### Get Chat History

```bash
GET /api/chat/:jobId
Authorization: Bearer YOUR_HR_TOKEN
```

#### Send Message

```bash
POST /api/chat/:jobId
Content-Type: application/json
Authorization: Bearer YOUR_HR_TOKEN

Body:
{
  "message": "Tell me about the top candidates"
}
```

## 📊 Application File Format

Your Excel/CSV files should have these columns (column names are flexible):

| Column | Description | Required |
|--------|-------------|----------|
| Job ID | Job posting ID | Optional (can use default) |
| Full Name | Applicant's name | Recommended |
| Email Address | Applicant's email | Recommended |
| Phone Number | Contact number | Optional |
| LinkedIn Profile URL | LinkedIn profile | Optional |
| Resume/CV Link | Google Drive or Dropbox link | Optional |
| Skills | Comma-separated skills | Optional |
| Experience | Years or description | Optional |
| Why interested? | Motivation question | Optional |
| Relevant experience | Experience details | Optional |

**Example Excel structure:**

```
Timestamp | Full Name | Email Address | Phone Number | Skills | Experience
---------|-----------|---------------|--------------|--------|------------
45948.92 | John Doe  | john@ex.com   | 1234567890   | React, Node.js | 3 years
```

## 🔧 Configuration

### Vector Dimensions

The system uses **768-dimensional vectors** (Gemini text-embedding-004):

```bash
VECTOR_DIM=768
```

### Gemini Models

The system automatically tries these models in order:
1. `gemini-2.5-flash` (fastest, recommended)
2. `gemini-flash-latest` (stable)
3. `gemini-2.0-flash` (fallback)
4. `gemini-pro-latest` (pro fallback)

You can override by setting:

```bash
GEMINI_CHAT_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "expected 1536 dimensions, not 768"

**Solution:** Run this SQL in Supabase:

```sql
ALTER TABLE application_chunks ALTER COLUMN embedding TYPE vector(768);
```

#### 2. "operator does not exist: uuid = text"

**Solution:** Your `job_id` column type doesn't match. Run:

```sql
ALTER TABLE application_chunks ALTER COLUMN job_id TYPE uuid USING job_id::uuid;
```

#### 3. Gemini API 403/404 Errors

**Solution:** 
- Verify your API key is correct
- Remove any custom `GEMINI_CHAT_URL` from `.env`
- Let the code use automatic model selection

#### 4. "No embeddings found"

**Solution:**
- Make sure you've uploaded application data first
- Check that `VECTOR_DIM=768` in your `.env`
- Verify the Supabase function exists

### Testing Your Setup

Test available Gemini models:

```bash
cd backend
node test-gemini-models.js
```

Check database connection:

```bash
# In Supabase SQL Editor
SELECT COUNT(*) FROM application_chunks;
```

## 🎨 Usage Examples

### Example Questions to Ask

- "How many candidates have applied?"
- "Who has the most experience with React?"
- "Show me candidates with Node.js skills"
- "Compare the top 3 candidates"
- "Which candidates are available immediately?"
- "List all candidates with 5+ years of experience"
- "Who mentioned they're interested in remote work?"

### Sample Workflow

1. **Create a job posting** in the frontend
2. **Upload applications** via Excel/CSV upload
3. **Wait for processing** (embeddings generation)
4. **Ask questions** in the chat interface
5. **Review AI responses** with source citations
6. **Make hiring decisions** based on insights

## 🔐 Security

- All API endpoints require HR token authentication
- Service role key is used server-side only
- Passwords and tokens should be kept in `.env` files
- Never commit `.env` files to version control
- Use Row Level Security (RLS) in Supabase for production

## 📈 Performance Tips

1. **Batch uploads:** Upload all applications at once for better efficiency
2. **Use specific questions:** More specific queries return better results
3. **Vector indexing:** The ivfflat index improves search speed
4. **Caching:** Consider implementing Redis for frequent queries
5. **Rate limiting:** Gemini API has rate limits, implement queuing for large batches

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Supabase** for database and vector storage
- **LangChain** for RAG framework
- **pgvector** for vector similarity search

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review API documentation

---

**Built with ❤️ using React, Express, Supabase, and Gemini AI**
