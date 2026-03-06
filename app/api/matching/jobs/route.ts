import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const db = getAdminClient();
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get('resumeId');

        if (!resumeId) {
            return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
        }

        // 1. Get Resume details
        const { data: resume, error: resumeError } = await db
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .single();
        if (resumeError || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // 2. Get all Jobs
        const { data: jobs } = await db.from('jobs').select('*');
        if (!jobs || jobs.length === 0) {
            return NextResponse.json([]);
        }

        // 3. Calculate matches using raw text
        const resumeText: string = (resume.parsed_data?.raw_text || resume.parsed_data?.skills?.join(' ') || '').toLowerCase();

        const matches = jobs.map((job: any) => {
            const jobSkills: string[] = job.required_skills || [];

            const matchedSkills: string[] = [];
            const missingSkills: string[] = [];

            for (const reqSkill of jobSkills) {
                const reqLower = reqSkill.toLowerCase();
                if (resumeText.includes(reqLower)) {
                    matchedSkills.push(reqSkill);
                } else {
                    missingSkills.push(reqSkill);
                }
            }

            const matchScore = jobSkills.length > 0
                ? Math.round((matchedSkills.length / jobSkills.length) * 100)
                : 0;

            return {
                jobId: job.id,
                jobTitle: job.title,
                matchScore,
                matchedSkills: matchedSkills,
                missingSkills: missingSkills,
            };
        }).sort((a: any, b: any) => b.matchScore - a.matchScore);

        // 4. Persist match scores
        const candidateId = resume.candidate_id;
        const matchInserts = matches.map((m: any) => ({
            candidate_id: candidateId,
            job_id: m.jobId,
            match_score: m.matchScore,
            status: 'matched',
            calculated_at: new Date().toISOString(),
        }));

        if (matchInserts.length > 0) {
            const { error: matchError } = await db
                .from('applications_matches')
                .upsert(matchInserts, { onConflict: 'candidate_id,job_id' });
            if (matchError) {
                console.error('Match upsert error:', matchError);
            } else {
                console.log('✅ Job match scores saved:', matchInserts.length, 'records');
            }
        }

        return NextResponse.json(matches);
    } catch (error) {
        console.error('Job matching error:', error);
        return NextResponse.json({ error: 'Failed to find job matches' }, { status: 500 });
    }
}
