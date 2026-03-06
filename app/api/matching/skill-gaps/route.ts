import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';
import { generateRoleSkills, generateImprovementSuggestions } from '@/lib/ai';

export async function GET(req: NextRequest) {
    try {
        const db = getAdminClient();
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get('resumeId');
        const role = searchParams.get('role');

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

        // 2. If no role provided, return an empty analysis state
        if (!role) {
            return NextResponse.json(null);
        }

        // 3. Extract required skills for this role via AI
        const requiredSkills = await generateRoleSkills(role);

        if (requiredSkills.length === 0) {
            return NextResponse.json({
                jobRole: role, matchedSkills: [], missingSkills: [], matchScore: 0, gapScore: 0, suggestions: []
            });
        }

        // 4. Match against raw resume text
        const resumeText: string = (resume.parsed_data?.raw_text || resume.parsed_data?.skills?.join(' ') || '').toLowerCase();

        const matchedSkills: string[] = [];
        const missingSkills: string[] = [];

        for (const reqSkill of requiredSkills) {
            if (resumeText.includes(reqSkill.toLowerCase())) {
                matchedSkills.push(reqSkill);
            } else {
                missingSkills.push(reqSkill);
            }
        }

        // 5. Calculate scores correctly complementing 100%
        const matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
        const gapScore = 100 - matchScore;

        // 6. Generate tailored suggestions for missing skills
        const suggestions = await generateImprovementSuggestions(role, missingSkills);

        return NextResponse.json({
            jobRole: role,
            matchedSkills,
            missingSkills,
            matchScore,
            gapScore,
            suggestions
        });

    } catch (error) {
        console.error('Skill gap error:', error);
        return NextResponse.json({ error: 'Failed to analyze skill gaps' }, { status: 500 });
    }
}
