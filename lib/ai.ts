import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Send a prompt to Groq and get a clean JSON response.
 */
async function askGroq(prompt: string): Promise<string> {
    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that ONLY responds with valid raw JSON. No markdown, no code fences, no explanation — just the JSON object or array.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.3,
        max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content?.trim() || '{}';
}

/**
 * Parse raw AI text into JSON, stripping any accidental markdown fences.
 */
function parseJSON(text: string): any {
    const cleaned = text.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned);
}

// ─── Resume Parsing (parse-only, for auto-fill) ─────────────────────

export interface ParsedResumeFields {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
    education: string;
}

export async function parseResumeFields(resumeText: string): Promise<ParsedResumeFields> {
    const prompt = `You are a resume parser. Extract the following information from this resume text.
Return ONLY a raw JSON object with exactly these keys:

{
  "name": "full name of the candidate",
  "email": "email address",
  "phone": "phone number",
  "skills": ["skill1", "skill2", ...],
  "experience": "brief summary of work experience with years",
  "education": "degrees and institutions"
}

Rules:
- If a field is not found, return an empty string "" or empty array []
- For skills, extract both technical and soft skills as an array of strings
- For experience, summarize in 1-2 sentences including total years if mentioned
- For education, include degree name and institution

Resume Text:
${resumeText}`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return {
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: parsed.experience || '',
        education: parsed.education || '',
    };
}

// ─── Resume Analysis (full extraction for DB storage) ───────────────

export interface ResumeAnalysis {
    skills: string[];
    experience: string;
    education: string;
    summary: string;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `Extract professional information from the following resume text.
Return the result as a raw JSON object with these keys:
- skills: string[] (list of technical and soft skills found)
- experience: string (short summary of years and roles)
- education: string (degrees and institutions)
- summary: string (2-3 sentence professional summary)

Resume Text:
${resumeText}`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return {
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: parsed.experience || '',
        education: parsed.education || '',
        summary: parsed.summary || '',
    };
}

// ─── Job Skill Extraction ───────────────────────────────────────────

export async function extractJobSkills(title: string, description: string): Promise<string[]> {
    const prompt = `Extract the required technical and professional skills from this job description.
Return a JSON array of strings. Each string should be a single skill name. Extract 5-15 skills.

Job Title: ${title}
Job Description: ${description}`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return Array.isArray(parsed) ? parsed : [];
}

// ─── Skill Gap Analysis ────────────────────────────────────────────

export interface SkillGapResult {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    recommendation: string;
}

export async function analyzeSkillGaps(
    candidateSkills: string[],
    marketSkills: string[]
): Promise<SkillGapResult[]> {
    const prompt = `Analyze the skill gaps for this candidate based on their resume skills and the current job market requirements.

Candidate Skills: ${candidateSkills.join(', ')}
Market Required Skills: ${marketSkills.length > 0 ? marketSkills.join(', ') : 'React, Python, AWS, Docker, TypeScript, SQL, Machine Learning'}

Return a JSON array of objects with these keys:
- skill: string (the missing skill name)
- importance: "high" | "medium" | "low"
- recommendation: string (personalized advice for learning this skill)

Provide exactly 3-5 key gaps. Only include skills the candidate is actually missing.`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return Array.isArray(parsed) ? parsed : [];
}

// ─── Dynamic Skill Gap Analysis ─────────────────────────────────────

export async function generateRoleSkills(role: string): Promise<string[]> {
    const prompt = `What are the top 5 to 10 most important required skills for a ${role}?
Return a JSON array of strings. Each string should be a single skill name. Do not include introductory text.`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return Array.isArray(parsed) ? parsed : [];
}

export async function generateImprovementSuggestions(
    role: string,
    missingSkills: string[]
): Promise<{ skill: string; recommendation: string }[]> {
    if (missingSkills.length === 0) return [];

    const prompt = `A candidate applying for a ${role} position is missing the following required skills: ${missingSkills.join(', ')}.
For each missing skill, provide a brief, actionable improvement suggestion (e.g., specific concepts to learn, small projects to build, tools to practice).

Return a JSON array of objects with these keys:
- skill: string (the exact missing skill name)
- recommendation: string (1-2 sentences of actionable advice)

Provide suggestions for every provided missing skill.`;

    const raw = await askGroq(prompt);
    const parsed = parseJSON(raw);

    return Array.isArray(parsed) ? parsed : [];
}
