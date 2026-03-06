import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const db = getAdminClient();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        // Get resume
        const { data: resume, error: resumeError } = await db
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single();

        if (resumeError || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Get profile separately
        const { data: profile } = await db
            .from('profiles')
            .select('full_name, email')
            .eq('id', resume.candidate_id)
            .single();

        // Get highest match score
        const { data: matches } = await db
            .from('applications_matches')
            .select('match_score')
            .eq('candidate_id', resume.candidate_id)
            .order('match_score', { ascending: false })
            .limit(1);

        const bestMatchScore = matches && matches.length > 0 ? matches[0].match_score : 0;

        return NextResponse.json({
            id: resume.id,
            candidateName: profile?.full_name || resume.parsed_data?.candidate_name || 'Unknown',
            email: profile?.email || resume.parsed_data?.email || '',
            phone: resume.parsed_data?.phone || '',
            skills: resume.parsed_data?.skills || [],
            experience: resume.parsed_data?.experience || '',
            education: resume.parsed_data?.education || '',
            summary: resume.parsed_data?.summary || '',
            matchScore: bestMatchScore,
            uploadedAt: resume.updated_at,
        });
    } catch (error) {
        console.error('Resume summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch resume summary' }, { status: 500 });
    }
}
