import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const HR_TOKEN = import.meta.env.VITE_HR_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-hr-token': HR_TOKEN
  }
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Jobs API
export const jobsAPI = {
  create: (jobData) => api.post('/api/jobs', jobData),
  getAll: () => api.get('/api/jobs'),
  getById: (id) => api.get(`/api/jobs/${id}`),
  update: (id, data) => api.patch(`/api/jobs/${id}`, data),
  delete: (id) => api.delete(`/api/jobs/${id}`)
};

// Interview API
export const interviewAPI = {
  createToken: (jobId, interviewerEmail) => 
    api.post('/api/interview/token', { jobId, interviewerEmail }),
  validateToken: (token) => 
    api.get(`/api/interview/validate/${token}`),
  submitReport: (reportData) => 
    api.post('/api/interview/report', reportData),
  getReports: (candidateId) => 
    api.get(`/api/interview/reports/${candidateId}`)
};

// Chat API
export const chatAPI = {
  getHistory: (jobId) => api.get(`/api/chat/${jobId}`),
  sendMessage: (jobId, message) => 
    api.post(`/api/chat/${jobId}`, { message }),
  clearHistory: (jobId) => api.delete(`/api/chat/${jobId}`)
};

export default api;