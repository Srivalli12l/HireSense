import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthUser } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';


// Contact candidate via SendGrid
export async function POST(req: NextRequest) {
    try {
        const db = getAdminClient();
        const payload = await req.json();

        // 1. Authenticate user
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
        }

        // 2. Verify user is a recruiter
        const { data: profile } = await db
            .from('profiles')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'recruiter') {
            return NextResponse.json({ error: 'Only recruiters can contact candidates.' }, { status: 403 });
        }

        const { candidateId, subject, message } = payload;

        if (!candidateId || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Get Candidate email from resumes table
        // Resumes table holds the parsed data including email
        const { data: resume, error: resumeError } = await db
            .from('resumes')
            .select('parsed_data')
            .eq('id', candidateId)
            .single();

        if (resumeError || !resume) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        const candidateEmail = resume.parsed_data?.email;
        const candidateName = resume.parsed_data?.name || 'Candidate';

        if (!candidateEmail) {
            return NextResponse.json({ error: 'Candidate email not available' }, { status: 400 });
        }

        // 4. Send Email via SendGrid
        try {
            await sendEmail({
                to: candidateEmail,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Message from ${profile.full_name || 'a Recruiter'}</h2>
                        <p>Hi ${candidateName},</p>
                        <div style="padding: 16px; background-color: #f4f4f5; border-radius: 8px; margin: 20px 0;">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                        <p>Best regards,<br/>${profile.full_name || 'Recruiter'}<br/><a href="mailto:${profile.email}">${profile.email}</a></p>
                    </div>
                `,
            });
            console.log('✅ Email sent via SendGrid');
        } catch (emailError: any) {
            console.error('Email sending failed:', emailError);

            // Extract SendGrid specific error message if available
            let errorMessage = 'Failed to send email via SendGrid';
            if (emailError.response && emailError.response.body && emailError.response.body.errors && emailError.response.body.errors.length > 0) {
                errorMessage = `SendGrid Error: ${emailError.response.body.errors[0].message}`;
            } else if (emailError.message) {
                errorMessage = `Email Error: ${emailError.message}`;
            }

            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        // 5. Log message to database
        const { error: dbError } = await db
            .from('messages')
            .insert({
                recruiter_id: user.id,
                candidate_id: candidateId,
                subject: subject,
                message: message,
            });

        if (dbError) {
            console.error('Failed to log message to DB:', dbError);
            // We don't fail the request here since the email was sent, but we log the error
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact candidate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
