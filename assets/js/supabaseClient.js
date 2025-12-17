import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
const supabaseAnonKey =
  'sb_publishable_he7X4Xjj74CcZfRue2RVTg_UsJSbyYC';

// SINGLE instance
const client = createClient(supabaseUrl, supabaseAnonKey);

// Export aliases (same object)
export const supabase = client;
export const supabaseClient = client;