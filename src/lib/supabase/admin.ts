import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Creates an administrative Supabase client using the Service Role Key.
 * NOTE: Never expose this client to the browser/client-side. Only use in API routes and Server Actions.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-service-key';

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
