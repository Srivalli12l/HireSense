import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthUser } from '@/lib/supabase-server';
import { extractJobSkills } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const db = getAdminClient();
        const job = await req.json();

        console.log('📝 Job POST received:', JSON.stringify({ title: job.title, location: job.location, skillCount: job.requiredSkills?.length }));

        // 1. Authenticate user
        const user = await getAuthUser(req);
        if (!user) {
            console.error('❌ Job POST: Unauthorized - no valid auth token');
            return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
        }

        console.log('✅ Auth OK:', user.id);

        // 2. Auto-extract skills from description using Groq AI (if none provided)
        let requiredSkills = job.requiredSkills;
        if ((!requiredSkills || requiredSkills.length === 0) && job.description) {
            try {
                requiredSkills = await extractJobSkills(job.title || '', job.description);
                console.log('✅ Groq extracted skills:', requiredSkills);
            } catch (aiError) {
                console.error('Groq skill extraction failed:', aiError);
                requiredSkills = [];
            }
        }

        // 3. Save to Supabase (admin client bypasses RLS)
        const insertData = {
            recruiter_id: user.id,
            title: job.title,
            description: job.description,
            required_skills: Array.isArray(requiredSkills) ? requiredSkills : [],
            salary_range: job.salaryRange || null,
            location: job.location || null,
        };
        console.log('📤 Inserting job:', JSON.stringify(insertData));

        const { data, error } = await db
            .from('jobs')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('❌ Job insert error:', JSON.stringify(error));
            return NextResponse.json({ error: 'Failed to save job: ' + error.message }, { status: 500 });
        }

        console.log('✅ Job saved to Supabase:', data.id);

        return NextResponse.json({
            id: data.id,
            title: data.title,
            description: data.description,
            requiredSkills: data.required_skills,
            salaryRange: data.salary_range,
            location: data.location,
            createdAt: data.created_at,
        });
    } catch (error) {
        console.error('❌ Job post error:', error);
        return NextResponse.json({ error: 'Failed to post job' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const db = getAdminClient();
        const { searchParams } = new URL(req.url);
        const recruiterId = searchParams.get('recruiterId');

        let query = db.from('jobs').select('*');

        if (recruiterId) {
            query = query.eq('recruiter_id', recruiterId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Jobs fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
        }

        const jobs = (data || []).map((j: any) => ({
            id: j.id,
            title: j.title,
            description: j.description,
            requiredSkills: j.required_skills || [],
            salaryRange: j.salary_range,
            location: j.location,
            createdAt: j.created_at,
        }));

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Jobs fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
