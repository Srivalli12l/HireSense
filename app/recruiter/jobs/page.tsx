'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MapPin, Trash2 } from 'lucide-react';
import { getJobs, type Job } from '@/lib/api-service';
import Link from 'next/link';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
        <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
          <Briefcase className="w-4 h-4 mr-2" />
          My Jobs
        </Button>
      </Link>
    </>
  );

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="My Jobs" sidebar={sidebar}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Jobs" sidebar={sidebar}>
      <div className="max-w-6xl mx-auto space-y-8">
        {error ? (
          <Card className="border-border border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : jobs.length === 0 ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>No Jobs Posted Yet</CardTitle>
              <CardDescription>
                Create your first job post to start finding great candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recruiter/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Post a Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="border-border hover:border-primary/50 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {job.salaryRange && (
                        <p className="text-sm text-muted-foreground font-semibold text-accent">
                          {job.salaryRange}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
