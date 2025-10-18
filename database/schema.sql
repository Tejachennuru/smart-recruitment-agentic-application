-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    qualifications TEXT,
    required_skills TEXT[] DEFAULT '{}',
    application_deadline TIMESTAMP WITH TIME ZONE,
    candidates_needed INTEGER DEFAULT 1,
    contact_email VARCHAR(255) NOT NULL,
    additional_notes TEXT,
    google_form_url TEXT,
    google_form_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    cover_letter TEXT,
    application_status VARCHAR(50) DEFAULT 'submitted',
    form_response_id VARCHAR(255),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, email)
);

-- Interview tokens table
CREATE TABLE interview_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    interviewer_email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview reports table
CREATE TABLE interview_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    interviewer_email VARCHAR(255) NOT NULL,
    interview_round VARCHAR(50) NOT NULL,
    technical_skills_rating INTEGER CHECK (technical_skills_rating BETWEEN 1 AND 10),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 10),
    cultural_fit_rating INTEGER CHECK (cultural_fit_rating BETWEEN 1 AND 10),
    overall_recommendation VARCHAR(50),
    strengths TEXT,
    weaknesses TEXT,
    detailed_feedback TEXT,
    follow_up_questions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table (for future RAG integration)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_status ON candidates(application_status);
CREATE INDEX idx_interview_tokens_token ON interview_tokens(token);
CREATE INDEX idx_interview_tokens_job_id ON interview_tokens(job_id);
CREATE INDEX idx_interview_reports_candidate_id ON interview_reports(candidate_id);
CREATE INDEX idx_chat_messages_job_id ON chat_messages(job_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_reports_updated_at BEFORE UPDATE ON interview_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();