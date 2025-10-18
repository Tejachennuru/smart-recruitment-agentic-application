import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

let supabaseAdmin;

// If config is missing, we avoid exiting so the server can start. Instead expose
// a proxy that throws at runtime when attempts are made to use Supabase.
if (!url || !serviceKey) {
  const msg = 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env';
  console.warn('❌', msg);

  const makeThrowing = (message) => {
    const thrower = () => { throw new Error(message); };
    return new Proxy(thrower, {
      get: () => makeThrowing(message),
      apply: () => { throw new Error(message); },
    });
  };

  supabaseAdmin = makeThrowing(msg);

} else {
  supabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { supabaseAdmin };
