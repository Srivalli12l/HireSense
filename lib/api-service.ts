// Real API Service for Resume Screening Platform
import { supabase, getCachedAccessToken } from '@/lib/supabase';

export interface Resume {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  matchScore?: number;
  uploadedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  salaryRange: string;
  location: string;
  createdAt: string;
}

export interface JobMatch {
  jobId: string;
  jobTitle: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SkillGapAnalysisResult {
  jobRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  gapScore: number;
  suggestions: {
    skill: string;
    recommendation: string;
  }[];
}

export interface CandidateRankEntry {
  candidateId: string;
  candidateName: string;
  email: string;
  matchScore: number;
  matchedSkills: number; // count
  matchedSkillsList?: string[];
  missingSkillsList?: string[];
  totalRequired: number;
  yearsOfExperience: number;
}

// Helper to get auth headers for API calls
// Uses cached token to avoid getSession() lock contention
async function getAuthHeaders(): Promise<Record<string, string>> {
  // 1. Try cached token first (no lock contention)
  const cachedToken = getCachedAccessToken();
  if (cachedToken) {
    return { 'Authorization': `Bearer ${cachedToken}` };
  }

  // 2. Fallback: single getSession() call (only on first load before cache is populated)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { 'Authorization': `Bearer ${session.access_token}` };
    }
  } catch (err) {
    console.error('Failed to get auth session:', err);
  }

  console.warn('No auth token available for API call');
  return {};
}

// Parse-only: extract fields from PDF for auto-fill (no DB save)
export async function parseResume(file: File): Promise<{
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/resumes/parse', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to parse resume');
  return data;
}

// Upload and save resume to Supabase
export async function uploadResume(formData: FormData): Promise<Resume> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch('/api/resumes/upload', {
    method: 'POST',
    headers: { ...authHeaders },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to upload resume');
  return data.resume;
}

export async function uploadJob(job: Partial<Job>): Promise<Job> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(job),
  });

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Job API returned non-JSON:', text.substring(0, 500));
    throw new Error(`Server error (${response.status}). Check terminal for details.`);
  }

  if (!response.ok) {
    console.error('Job API error:', response.status, data);
    throw new Error(data.error || `Failed to upload job (${response.status})`);
  }
  return data;
}

export async function getResumes(): Promise<Resume[]> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch('/api/matching/candidates?all=true', {
    headers: { ...authHeaders },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getJobs(): Promise<Job[]> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch('/api/jobs', {
    headers: { ...authHeaders },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function findJobMatches(resumeId: string): Promise<JobMatch[]> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/matching/jobs?resumeId=${resumeId}`, {
    headers: { ...authHeaders },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getSkillGaps(resumeId: string, role?: string): Promise<SkillGapAnalysisResult | null> {
  if (!role) return null;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/matching/skill-gaps?resumeId=${resumeId}&role=${encodeURIComponent(role)}`, {
    headers: { ...authHeaders },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function rankCandidatesForJob(jobId: string): Promise<CandidateRankEntry[]> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/matching/candidates?jobId=${jobId}`, {
    headers: { ...authHeaders },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getResumeSummary(resumeId: string): Promise<Resume | null> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/resumes/summary?id=${resumeId}`, {
    headers: { ...authHeaders },
  });
  if (!response.ok) return null;
  return response.json();
}
