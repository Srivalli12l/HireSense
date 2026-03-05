'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, BookOpen, Award, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Mock candidate data
const mockCandidates: Record<string, any> = {
  'c1': {
    id: 'c1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    experience: '5 years',
    title: 'Senior Frontend Engineer',
    summary: 'Experienced full-stack developer with expertise in modern web technologies and cloud infrastructure.',
    matchScore: 92,
  },
  'c2': {
    id: 'c2',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    phone: '+1 (555) 234-5678',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
    experience: '7 years',
    title: 'Backend Engineer',
    summary: 'Passionate about building scalable backend systems and mentoring junior developers.',
    matchScore: 88,
  },
  'c3': {
    id: 'c3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1 (555) 345-6789',
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Figma'],
    experience: '3 years',
    title: 'Frontend Developer',
    summary: 'Creative developer focused on building beautiful and responsive user interfaces.',
    matchScore: 85,
  },
};

export default function CandidateSummary() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const candidate = mockCandidates[candidateId];

  const sidebar = (
    <>
      <Link href="/recruiter/dashboard">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Briefcase className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link href="/recruiter/jobs">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Briefcase className="w-4 h-4 mr-2" />
          My Jobs
        </Button>
      </Link>
    </>
  );

  if (!candidate) {
    return (
      <DashboardLayout title="Candidate Profile" sidebar={sidebar}>
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Candidate not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={candidate.name} sidebar={sidebar}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <CardTitle className="text-3xl mb-2">{candidate.name}</CardTitle>
                <p className="text-lg text-accent font-semibold mb-2">{candidate.title}</p>
                <p className="text-muted-foreground">{candidate.experience} of experience</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {candidate.matchScore}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Match Score</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <a href={`mailto:${candidate.email}`} className="text-accent hover:underline">
                {candidate.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">{candidate.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{candidate.summary}</p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill: string) => (
                <Badge
                  key={skill}
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Candidate
          </Button>
          <Link href="/recruiter/jobs">
            <Button variant="outline" className="border-border hover:bg-primary/5">
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
