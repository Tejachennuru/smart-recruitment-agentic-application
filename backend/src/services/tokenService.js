import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';

export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createInterviewToken = async (jobId, interviewerEmail) => {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

  const { data, error } = await supabase
    .from('interview_tokens')
    .insert({
      job_id: jobId,
      token,
      interviewer_email: interviewerEmail,
      expires_at: expiresAt.toISOString(),
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const validateInterviewToken = async (token) => {
  const { data, error } = await supabase
    .from('interview_tokens')
    .select('*, jobs(*)')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Check expiration
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
};