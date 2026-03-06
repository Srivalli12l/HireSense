'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResumeUpload } from '@/components/resume-upload';
import { JobMatches } from '@/components/job-matches';
import { SkillGaps } from '@/components/skill-gaps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CandidateDashboard() {
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

  const sidebar = (
    <>
      <Link href="/candidate/dashboard">
        <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
          <FileText className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link href="/candidate/resumes">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <FileText className="w-4 h-4 mr-2" />
          My Resumes
        </Button>
      </Link>
    </>
  );

  return (
    <DashboardLayout title="Candidate Dashboard" sidebar={sidebar}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/20 via-accent/10 to-background overflow-hidden relative group">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to HireSense
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Upload your resume to discover job opportunities that match your skills
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upload Section */}
        <div>
          <ResumeUpload
            onSuccess={(resume) => {
              setUploadedResumeId(resume.id);
            }}
          />
        </div>

        {/* Results Section */}
        {uploadedResumeId && (
          <div className="grid lg:grid-cols-2 gap-8">
            <JobMatches resumeId={uploadedResumeId} />
            <SkillGaps resumeId={uploadedResumeId} />
          </div>
        )}

        {/* Info Cards */}
        {!uploadedResumeId && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Upload Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share your professional information and let our AI analyze your qualifications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Find Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get matched with job opportunities that align with your skills and experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Grow Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive personalized recommendations to close skill gaps and advance your career.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
