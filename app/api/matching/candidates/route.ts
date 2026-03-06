import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const db = getAdminClient();
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        const all = searchParams.get('all');

        // Return all resumes (for recruiter sidebar / candidate listing)
        if (all === 'true') {
            const { data, error } = await db
                .from('resumes')
                .select('id, candidate_id, parsed_data, updated_at');
            if (error) {
                console.error('Resumes fetch error:', error);
                return NextResponse.json([]);
            }

            // Get profiles separately to avoid join issues
            const candidateIds = (data || []).map((r: any) => r.candidate_id);
            const { data: profiles } = await db
                .from('profiles')
                .select('id, full_name, email')
                .in('id', candidateIds);

            const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

            return NextResponse.json((data || []).map((r: any) => {
                const profile = profileMap.get(r.candidate_id);
                return {
                    id: r.id,
                    candidateName: profile?.full_name || r.parsed_data?.candidate_name || 'Unknown',
                    email: profile?.email || r.parsed_data?.email || '',
                    skills: r.parsed_data?.skills || [],
                    experience: r.parsed_data?.experience || '',
                    uploadedAt: r.updated_at,
                };
            }));
        }

        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        // 1. Get Job details
        const { data: job, error: jobError } = await db
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (jobError || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // 2. Get all resumes
        const { data: resumes } = await db
            .from('resumes')
            .select('id, candidate_id, parsed_data');
        if (!resumes || resumes.length === 0) {
            return NextResponse.json([]);
        }

        // Get profiles
        const candidateIds = resumes.map((r: any) => r.candidate_id);
        const { data: profiles } = await db
            .from('profiles')
            .select('id, full_name, email')
            .in('id', candidateIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        // 3. Calculate match scores
        const rankedCandidates = resumes.map((resume: any) => {
            const resumeText: string = (resume.parsed_data?.raw_text || resume.parsed_data?.skills?.join(' ') || '').toLowerCase();
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

            const profile = profileMap.get(resume.candidate_id);

            return {
                candidateId: resume.candidate_id,
                candidateName: profile?.full_name || resume.parsed_data?.candidate_name || 'Unknown',
                email: profile?.email || '',
                matchScore,
                matchedSkills: matchedSkills.length, // Keeping as length for UI compatibility
                matchedSkillsList: matchedSkills, // Adding the actual lists just in case
                missingSkillsList: missingSkills,
                totalRequired: jobSkills.length,
                yearsOfExperience: parseInt(resume.parsed_data?.experience) || 0,
            };
        }).sort((a: any, b: any) => b.matchScore - a.matchScore);

        // 4. Persist match scores to applications_matches table
        const matchInserts = rankedCandidates.map((c: any) => ({
            candidate_id: c.candidateId,
            job_id: jobId,
            match_score: c.matchScore,
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
                console.log('✅ Match scores saved:', matchInserts.length, 'records');
            }
        }

        return NextResponse.json(rankedCandidates);
    } catch (error) {
        console.error('Candidate ranking error:', error);
        return NextResponse.json({ error: 'Failed to rank candidates' }, { status: 500 });
    }
}
