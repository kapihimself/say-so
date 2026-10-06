import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service-role key.
 * Returns null when Supabase is not configured, so callers can degrade to
 * local-only persistence instead of throwing.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    db: { schema: 'english' },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
