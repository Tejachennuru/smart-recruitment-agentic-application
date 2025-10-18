import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8080/http/gemini-create-form';
const MCP_API_KEY = process.env.MCP_API_KEY;

/**
 * Call the Google Forms MCP server to create a form
 * 
 * INTEGRATION POINT: This function calls your existing MCP server
 * The MCP server (from document 1) handles:
 * 1. Calling Gemini API to generate form structure
 * 2. Creating the Google Form via Google Forms API
 * 3. Adding questions to the form
 * 
 * @param {Object} jobData - Job posting data
 * @returns {Promise<Object>} - Form creation result with formId and responderUri
 */
export const createGoogleForm = async (jobData) => {
  try {
    // Transform job data into format expected by MCP server
    const payload = {
      title: `Application: ${jobData.job_title}`,
      description: jobData.description || '',
      questions: [
        {
          type: 'text',
          questionTitle: 'Full Name',
          required: true
        },
        {
          type: 'text',
          questionTitle: 'Email Address',
          required: true
        },
        {
          type: 'text',
          questionTitle: 'Phone Number',
          required: false
        },
        {
          type: 'text',
          questionTitle: 'LinkedIn Profile URL',
          required: false
        },
        {
          type: 'text',
          questionTitle: 'Resume/CV Link (Google Drive or Dropbox)',
          required: true
        },
        {
          type: 'text',
          questionTitle: 'Why are you interested in this position?',
          required: true
        },
        {
          type: 'text',
          questionTitle: 'What relevant experience do you have?',
          required: true
        },
        ...(jobData.required_skills && jobData.required_skills.length > 0 ? [
          {
            type: 'mc',
            questionTitle: `Rate your proficiency in: ${jobData.required_skills.join(', ')}`,
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            required: true
          }
        ] : []),
        {
          type: 'text',
          questionTitle: 'When can you start?',
          required: true
        }
      ]
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    if (MCP_API_KEY) {
      headers['Authorization'] = `Bearer ${MCP_API_KEY}`;
    }

    console.log('Calling MCP server at:', MCP_SERVER_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(MCP_SERVER_URL, payload, {
      headers,
      timeout: 60000 // 60 second timeout
    });

    if (!response.data || !response.data.success) {
      throw new Error('MCP server did not return success');
    }

    const formData = response.data.form;
    
    return {
      success: true,
      formId: formData.formId,
      formUrl: formData.responderUri,
      title: formData.title
    };

  } catch (error) {
    console.error('MCP client error:', error.response?.data || error.message);
    throw new Error(`Failed to create Google Form: ${error.message}`);
  }
};

// TODO: Future RAG integration
// This function will send job and candidate data to a vector database
// for semantic search and AI-powered chat responses
export const indexJobDataForRAG = async (jobId, jobData) => {
  // TODO: Implement vector embedding and storage
  // 1. Generate embeddings for job description and requirements
  // 2. Store in vector database (e.g., Pinecone, Weaviate, or Supabase pgvector)
  // 3. Associate with job ID for retrieval
  console.log('[TODO] RAG indexing for job:', jobId);
  return { success: true, message: 'RAG indexing not yet implemented' };
};