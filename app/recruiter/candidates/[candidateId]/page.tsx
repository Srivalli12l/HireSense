'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, BookOpen, Award, Mail, Loader2 } from 'lucide-react';
import { getResumeSummary } from '@/lib/api-service';
import Link from 'next/link';
import { ContactCandidateDialog } from '@/components/contact-candidate-dialog';

export default function CandidateSummary() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setIsLoading(true);
        const data = await getResumeSummary(candidateId);
        if (data) {
          setCandidate({
            ...data,
            name: data.candidateName,
            title: data.experience?.includes('Engineer') ? data.experience : 'Candidate', // Simple heuristic
            matchScore: data.matchScore || 0,
          });
        }
      } catch (err) {
        setError('Failed to load candidate information');
      } finally {
        setIsLoading(false);
      }
    };
    if (candidateId) loadCandidate();
  }, [candidateId]);

  if (isLoading) {
    return (
      <DashboardLayout title="Candidate Profile" sidebar={sidebar}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !candidate) {
    return (
      <DashboardLayout title="Candidate Profile" sidebar={sidebar}>
        <Card className="border-border border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error || 'Candidate not found'}</p>
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
          <ContactCandidateDialog
            candidateId={candidateId}
            candidateName={candidate.name}
            candidateEmail={candidate.email}
          />
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
