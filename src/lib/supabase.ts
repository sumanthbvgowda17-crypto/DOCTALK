import { createClient } from '@supabase/supabase-js';

// Read configuration from environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawSupabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
)?.trim();

/**
 * Returns true if both the Supabase URL and Publishable/Anon key are properly provided.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!rawSupabaseUrl || !rawSupabaseKey) return false;
  try {
    const url = new URL(rawSupabaseUrl);
    return (
      url.protocol === 'https:' &&
      !url.hostname.includes('placeholder') &&
      !url.hostname.includes('your-project-id')
    );
  } catch {
    return false;
  }
};

// Fallback safe URL to prevent immediate crash if env is missing
const validUrl = isSupabaseConfigured()
  ? rawSupabaseUrl!
  : 'https://placeholder-project.supabase.co';

const validKey = rawSupabaseKey || 'sb_publishable_placeholder';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor';
  phone?: string;
  created_at?: string;
  updated_at?: string;
}
