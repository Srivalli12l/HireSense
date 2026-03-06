import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase ADMIN client using the service role key.
 * This bypasses RLS entirely — use for all server-side DB reads/writes.
 */
export function getAdminClient(): SupabaseClient {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Extracts the authenticated user from the request's JWT token.
 * Returns the user object if authenticated, null otherwise.
 */
export async function getAuthUser(req: NextRequest) {
    // 1. Try Authorization header (sent by api-service.ts)
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
        // Use the admin client to verify the JWT and get user details
        const adminClient = getAdminClient();
        const { data: { user }, error } = await adminClient.auth.getUser(token);
        if (user && !error) return user;
    }

    // 2. Fallback: try getting session from cookies
    const cookies = req.headers.get('cookie') || '';
    if (cookies) {
        const cookieClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { cookie: cookies },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        const { data: { user }, error } = await cookieClient.auth.getUser();
        if (user && !error) return user;
    }

    return null;
}
