import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl && typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_SUPABASE_URL is missing! Auth and Database features will not work.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// ─── Session Token Cache ────────────────────────────────────────────
// Avoids concurrent getSession() calls that cause the
// "Lock broken by another request with the 'steal' option" error.
// The onAuthStateChange listener keeps the token up-to-date automatically.

let _cachedAccessToken: string | null = null;

if (typeof window !== 'undefined') {
    // Initialize cache from current session (one-time, no contention)
    supabase.auth.getSession().then(({ data: { session } }) => {
        _cachedAccessToken = session?.access_token ?? null;
    });

    // Keep cache updated on every auth event (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
        _cachedAccessToken = session?.access_token ?? null;
    });
}

/**
 * Returns the cached access token without calling getSession().
 * This prevents the storage lock contention issue.
 */
export function getCachedAccessToken(): string | null {
    return _cachedAccessToken;
}
