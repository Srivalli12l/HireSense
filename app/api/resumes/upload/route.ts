import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthUser } from '@/lib/supabase-server';
import { analyzeResume } from '@/lib/ai';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
    try {
        const db = getAdminClient();

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const candidateName = formData.get('candidateName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Authenticate user via JWT
        const user = await getAuthUser(req);
        let userId = user?.id;

        // Fallback: find user by email if JWT wasn't forwarded
        if (!userId && email) {
            const { data: profile } = await db
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();
            userId = profile?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized — please log in first' }, { status: 401 });
        }

        // 2. Extract text from PDF
        const bytes = await file.arrayBuffer();
        const pdfBuffer = Buffer.from(bytes);
        let resumeText = '';
        try {
            const pdfData = await pdf(pdfBuffer);
            resumeText = pdfData.text;
        } catch {
            const decoder = new TextDecoder();
            resumeText = decoder.decode(pdfBuffer);
        }

        // 3. Parse with Groq AI
        const parsedData = await analyzeResume(resumeText);

        // 4. Save to Supabase (admin client bypasses RLS)
        const { data: resume, error: dbError } = await db
            .from('resumes')
            .upsert({
                candidate_id: userId,
                parsed_data: {
                    ...parsedData,
                    raw_text: resumeText,
                    candidate_name: candidateName,
                    email: email,
                    phone: phone || '',
                },
                updated_at: new Date().toISOString(),
            }, { onConflict: 'candidate_id' })
            .select()
            .single();

        if (dbError) {
            console.error('DB insert error:', dbError);
            return NextResponse.json({ error: 'Failed to save resume: ' + dbError.message }, { status: 500 });
        }

        console.log('✅ Resume saved to Supabase:', resume.id);

        return NextResponse.json({
            message: 'Resume parsed and saved successfully',
            resume: {
                id: resume.id,
                candidateName,
                email,
                phone: phone || '',
                skills: parsedData.skills,
                experience: parsedData.experience,
                education: parsedData.education,
                summary: parsedData.summary,
            }
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
