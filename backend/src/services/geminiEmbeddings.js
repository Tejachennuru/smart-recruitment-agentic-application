import axios from 'axios';

// Simple embeddings adapter compatible with LangChain's Embeddings interface
export class GeminiEmbeddings {
  constructor({ apiKey, embeddingModel = 'text-embedding-004', targetDim = 1536, embeddingUrl } = {}) {
    if (!apiKey) throw new Error('GeminiEmbeddings: apiKey is required');
    this.apiKey = apiKey;
    this.embeddingModel = embeddingModel;
    this.targetDim = Number(targetDim) || 1536;
    this.embeddingUrl = embeddingUrl; // optional override
  }

  normalize(vec) {
    const dim = this.targetDim;
    const out = new Array(dim).fill(0);
    const n = Math.min(dim, (vec?.length) || 0);
    for (let i = 0; i < n; i++) out[i] = vec[i];
    return out;
  }

  async embedQuery(text) {
    try {
      // Build the correct endpoint for text-embedding-004
      let url = this.embeddingUrl;
      if (!url) {
        // Use the correct embedContent endpoint for text-embedding-004
        url = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
      } else {
        // If the provided URL looks like a base domain, construct the proper path
        try {
          const u = new URL(url);
          if (!u.pathname || u.pathname === '/' || !u.pathname.includes('embed')) {
            u.pathname = `/v1beta/models/${this.embeddingModel}:embedContent`;
            if (!u.searchParams.has('key')) {
              u.searchParams.set('key', this.apiKey);
            }
            url = u.toString();
          }
        } catch (e) {
          url = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
        }
      }

      // Use the correct request format for embedContent
      const resp = await axios.post(url, {
        model: `models/${this.embeddingModel}`,
        content: {
          parts: [{ text }]
        }
      });

      // Extract embedding from the response
      const raw = resp.data?.embedding?.values;
      if (!raw || !Array.isArray(raw)) {
        console.error('Gemini API Response:', JSON.stringify(resp.data, null, 2));
        throw new Error('GeminiEmbeddings: bad embedding response - no values array found');
      }
      
      return this.normalize(raw);
    } catch (error) {
      // Enhanced error logging
      if (error.response) {
        console.error('Gemini API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url
        });
        throw new Error(`Gemini API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Gemini API No Response:', error.message);
        throw new Error(`Gemini API: No response received - ${error.message}`);
      } else {
        console.error('Gemini API Request Error:', error.message);
        throw error;
      }
    }
  }

  async embedDocuments(texts) {
    // The API supports batch embedding, but we'll keep sequential for simplicity and rate limiting
    const results = [];
    for (const t of texts) {
      // eslint-disable-next-line no-await-in-loop
      const emb = await this.embedQuery(t);
      results.push(emb);
    }
    return results;
  }
}