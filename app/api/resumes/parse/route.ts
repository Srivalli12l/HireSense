import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { parseResumeFields } from '@/lib/ai';

/**
 * POST /api/resumes/parse
 * Parse-only endpoint: extracts structured info from a PDF resume.
 * Does NOT save to database — just returns the extracted fields for auto-fill.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Extract text from PDF
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

        if (!resumeText || resumeText.trim().length < 10) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
        }

        // 2. Extract structured data with Groq AI
        const parsed = await parseResumeFields(resumeText);

        return NextResponse.json(parsed);

    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse resume' },
            { status: 500 }
        );
    }
}
