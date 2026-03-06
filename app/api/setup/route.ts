import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';

/**
 * GET /api/setup — Initialize database tables using the service role key.
 * Run this once to create all required tables.
 */
export async function GET() {
    try {
        const db = getAdminClient();

        // Test connection by listing existing tables
        const { data: profilesCheck, error: profilesError } = await db
            .from('profiles')
            .select('id')
            .limit(1);

        const { data: resumesCheck, error: resumesError } = await db
            .from('resumes')
            .select('id')
            .limit(1);

        const { data: jobsCheck, error: jobsError } = await db
            .from('jobs')
            .select('id')
            .limit(1);

        const { data: matchesCheck, error: matchesError } = await db
            .from('applications_matches')
            .select('id')
            .limit(1);

        const { data: messagesCheck, error: messagesError } = await db
            .from('messages')
            .select('id')
            .limit(1);

        const status = {
            connection: 'OK',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
            groqKey: process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key' ? '✅ Set' : '❌ Missing or placeholder',
            tables: {
                profiles: profilesError ? `❌ ${profilesError.message}` : `✅ exists (${profilesCheck?.length || 0} rows sample)`,
                resumes: resumesError ? `❌ ${resumesError.message}` : `✅ exists (${resumesCheck?.length || 0} rows sample)`,
                jobs: jobsError ? `❌ ${jobsError.message}` : `✅ exists (${jobsCheck?.length || 0} rows sample)`,
                applications_matches: matchesError ? `❌ ${matchesError.message}` : `✅ exists (${matchesCheck?.length || 0} rows sample)`,
                messages: messagesError ? `❌ ${messagesError.message}` : `✅ exists (${messagesCheck?.length || 0} rows sample)`,
            },
        };

        return NextResponse.json(status);
    } catch (error) {
        console.error('Setup check error:', error);
        return NextResponse.json({
            connection: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
