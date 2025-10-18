import axios from 'axios';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { supabaseAdmin } from '../config/supabase.js';
import { GeminiEmbeddings } from './geminiEmbeddings.js';

const REQUIRED_ENV = ['GEMINI_API_KEY'];

function verifyEnv() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

async function geminiChat(systemPrompt, userPrompt) {
  verifyEnv();
  const key = process.env.GEMINI_API_KEY;
  
  // Use the stable models available with your API key
  const modelsToTry = [
    'models/gemini-2.5-flash',           // Fast and efficient
    'models/gemini-flash-latest',        // Latest stable flash
    'models/gemini-2.0-flash',           // Fallback to 2.0
    'models/gemini-pro-latest',          // Pro model fallback
  ];
  
  let url = process.env.GEMINI_CHAT_URL;
  if (url) {
    const urlObj = new URL(url);
    if (!urlObj.searchParams.has('key')) {
      urlObj.searchParams.set('key', key);
    }
    url = urlObj.toString();
  }
  
  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  let lastError = null;
  
  // If custom URL provided, try it first
  if (url) {
    try {
      console.log('🔑 Calling Gemini API with custom URL...');
      const resp = await axios.post(url, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const candidates = resp.data?.candidates || [];
      const parts = candidates[0]?.content?.parts || [];
      const text = parts.map(p => p.text).filter(Boolean).join('\n');
      
      if (text) {
        console.log('✅ Gemini response generated successfully');
        return text;
      }
    } catch (error) {
      console.warn('Custom URL failed, trying default models...');
      lastError = error;
    }
  }
  
  // Try each model in sequence
  for (const model of modelsToTry) {
    try {
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(key)}`;
      console.log(`🔑 Trying model: ${model}...`);
      
      const resp = await axios.post(modelUrl, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const candidates = resp.data?.candidates || [];
      const parts = candidates[0]?.content?.parts || [];
      const text = parts.map(p => p.text).filter(Boolean).join('\n');
      
      if (text) {
        console.log(`✅ Success with ${model}`);
        return text;
      }
    } catch (error) {
      console.warn(`❌ Model ${model} failed:`, error.response?.data?.error?.message || error.message);
      lastError = error;
      continue; // Try next model
    }
  }
  
  // If all models failed
  const errorMsg = lastError?.response?.data?.error?.message || lastError?.message || 'All models failed';
  console.error('All Gemini models failed. Last error:', errorMsg);
  throw new Error(`Gemini chat failed: ${errorMsg}`);
}

export async function answerWithRag({ jobId, question }) {
  verifyEnv();
  
  try {
    const embeddings = new GeminiEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      embeddingUrl: process.env.GEMINI_EMBEDDING_URL,
      targetDim: parseInt(process.env.VECTOR_DIM) || 768,
    });

    console.log(`🔍 Creating vector store with dimension: ${embeddings.targetDim}`);

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client: supabaseAdmin,
      tableName: 'application_chunks',
      queryName: 'match_application_chunks',
    });

    console.log(`📊 Searching for relevant documents for job: ${jobId}`);
    
    const docs = await vectorStore.similaritySearch(question, 8, { job_id: jobId });

    console.log(`✅ Found ${docs.length} relevant documents`);

    if (docs.length === 0) {
      return {
        answer: "I couldn't find any relevant information in the applications for this job. This could mean:\n\n1. No applications have been uploaded yet\n2. The applications don't contain information related to your question\n3. Try rephrasing your question\n\nPlease make sure applications have been uploaded for this job posting.",
        sources: [],
      };
    }

    const context = docs
      .map((d, i) => {
        const name = d.metadata?.applicant_name || d.metadata?.applicant_email || 'Unknown Applicant';
        return `# Applicant ${i + 1}: ${name}\n${d.pageContent}`;
      })
      .join('\n\n---\n\n');

    const system = `You are an HR recruiting assistant helping to analyze job applications. 

Your role:
- Answer questions about candidates based on the provided application data
- Be specific and cite applicant names/emails when relevant
- If information is unclear or missing, say so
- Provide actionable insights for hiring decisions
- Compare candidates when asked
- Summarize key qualifications and experience

Important: Base your answers ONLY on the provided context. Do not make assumptions about information not present in the applications.`;

    const user = `Question: ${question}\n\nJob Applications Context:\n${context}`;

    console.log(`🤖 Generating response with Gemini...`);

    const answer = await geminiChat(system, user);

    return {
      answer: answer || 'Unable to generate a response. Please try again.',
      sources: docs.map((d) => ({
        applicant_name: d.metadata?.applicant_name || 'Unknown',
        applicant_email: d.metadata?.applicant_email || 'N/A',
        snippet: d.pageContent?.slice(0, 200) + '...',
      })),
    };

  } catch (error) {
    console.error('❌ RAG error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    
    throw new Error(`RAG query failed: ${error.message}`);
  }
}