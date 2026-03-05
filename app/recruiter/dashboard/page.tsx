'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { JobUpload } from '@/components/job-upload';
import { CandidateRanking } from '@/components/candidate-ranking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterDashboard() {
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const sidebar = (
    <>
      <Link href="/recruiter/dashboard">
        <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
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
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">
          Sample Candidates
        </p>
        <Link href="/recruiter/candidates/c1">
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground">
            <Users className="w-4 h-4 mr-2" />
            Sarah Johnson
          </Button>
        </Link>
        <Link href="/recruiter/candidates/c2">
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground">
            <Users className="w-4 h-4 mr-2" />
            Mike Chen
          </Button>
        </Link>
        <Link href="/recruiter/candidates/c3">
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground">
            <Users className="w-4 h-4 mr-2" />
            Emily Rodriguez
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Recruiter Dashboard" sidebar={sidebar}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Card */}
        <Card className="border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle>Welcome to Resume AI for Recruiters</CardTitle>
            <CardDescription>
              Post job openings and discover the best candidates from our database
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upload Section */}
        <div>
          <JobUpload
            onSuccess={(job) => {
              setCreatedJobId(job.id);
            }}
          />
        </div>

        {/* Results Section */}
        {createdJobId && (
          <div>
            <CandidateRanking jobId={createdJobId} />
          </div>
        )}

        {/* Info Cards */}
        {!createdJobId && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Post Job</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create detailed job postings with required skills and requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Find Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get matched with candidates from our database using AI-powered ranking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Hire Better</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Make informed decisions with detailed candidate scores and skill analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
