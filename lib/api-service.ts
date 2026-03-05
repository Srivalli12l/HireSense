// Mock API Service for Resume Screening Platform
// All functions simulate API calls with realistic delays

export interface Resume {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
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

export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface CandidateRankEntry {
  candidateId: string;
  candidateName: string;
  email: string;
  matchScore: number;
  matchedSkills: number;
  totalRequired: number;
  yearsOfExperience: number;
}

// Sample data
const sampleResumes: Resume[] = [
  {
    id: 'resume-1',
    candidateName: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0123',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    experience: '5 years of full-stack development',
    education: 'BS Computer Science from MIT',
    summary: 'Experienced full-stack developer with strong problem-solving skills',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resume-2',
    candidateName: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1-555-0456',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'SQL'],
    experience: '3 years in ML/AI development',
    education: 'MS Data Science from Stanford',
    summary: 'ML engineer passionate about building intelligent systems',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced developer to lead our web platform',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    salaryRange: '$120K - $160K',
    location: 'San Francisco, CA',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-2',
    title: 'ML Engineer',
    description: 'Join our AI research team to develop cutting-edge models',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    salaryRange: '$130K - $180K',
    location: 'Mountain View, CA',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// API Functions
export async function uploadResume(resume: Resume): Promise<Resume> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { ...resume, id: `resume-${Date.now()}` };
}

export async function uploadJob(job: Job): Promise<Job> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { ...job, id: `job-${Date.now()}` };
}

export async function getResumes(): Promise<Resume[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return sampleResumes;
}

export async function getJobs(): Promise<Job[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return sampleJobs;
}

export async function findJobMatches(resumeId: string): Promise<JobMatch[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const resume = sampleResumes.find(r => r.id === resumeId);
  if (!resume) return [];

  return sampleJobs.map(job => {
    const matched = resume.skills.filter(skill =>
      job.requiredSkills.some(req =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    const missing = job.requiredSkills.filter(req =>
      !resume.skills.some(skill =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );

    const matchScore = Math.round((matched.length / job.requiredSkills.length) * 100);

    return {
      jobId: job.id,
      jobTitle: job.title,
      matchScore,
      matchedSkills: matched,
      missingSkills: missing,
    };
  });
}

export async function getSkillGaps(resumeId: string): Promise<SkillGap[]> {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const resume = sampleResumes.find(r => r.id === resumeId);
  if (!resume) return [];

  const gaps: SkillGap[] = [
    {
      skill: 'Kubernetes',
      importance: 'high',
      recommendation: 'Consider learning Kubernetes for container orchestration. Many enterprise roles require this.',
    },
    {
      skill: 'GraphQL',
      importance: 'medium',
      recommendation: 'GraphQL is becoming popular for API design. Learn it to stay competitive.',
    },
    {
      skill: 'System Design',
      importance: 'high',
      recommendation: 'System design skills are crucial for senior roles. Practice designing scalable systems.',
    },
  ];

  return gaps;
}

export async function rankCandidatesForJob(jobId: string): Promise<CandidateRankEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const job = sampleJobs.find(j => j.id === jobId);
  if (!job) return [];

  return sampleResumes.map(resume => {
    const matched = resume.skills.filter(skill =>
      job.requiredSkills.some(req =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
    ).length;

    return {
      candidateId: resume.id,
      candidateName: resume.candidateName,
      email: resume.email,
      matchScore: Math.round((matched / job.requiredSkills.length) * 100),
      matchedSkills: matched,
      totalRequired: job.requiredSkills.length,
      yearsOfExperience: Math.floor(Math.random() * 8) + 2,
    };
  });
}

export async function getResumeSummary(resumeId: string): Promise<Resume | null> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return sampleResumes.find(r => r.id === resumeId) || null;
}
