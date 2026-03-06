import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email, subject, message } = await req.json();

        if (!email || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields: email, subject, message' }, { status: 400 });
        }

        await sendEmail({
            to: email,
            subject: subject,
            html: message,
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully via SendGrid' });
    } catch (error: any) {
        console.error('Send-email API error:', error);

        // Extract SendGrid specific error message if available
        let errorMessage = 'Failed to send email via SendGrid';
        let details = error.message;

        if (error.response && error.response.body && error.response.body.errors && error.response.body.errors.length > 0) {
            errorMessage = `SendGrid Error: ${error.response.body.errors[0].message}`;
            details = error.response.body.errors;
        } else if (error.message) {
            errorMessage = `Email Error: ${error.message}`;
        }

        return NextResponse.json({
            error: errorMessage,
            details: details
        }, { status: 500 });
    }
}
