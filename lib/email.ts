import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not set');
    }

    const msg = {
        to,
        from: 'support@yourdomain.com', // Replace with your verified SendGrid sender
        subject,
        text: text || html?.replace(/<[^>]*>/g, '') || '',
        html: html || text?.replace(/\n/g, '<br/>') || '',
    };

    try {
        const response = await sgMail.send(msg);
        return response;
    } catch (error: any) {
        console.error('SendGrid Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
}
