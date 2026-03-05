'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Trash2 } from 'lucide-react';
import { getResumes, type Resume } from '@/lib/api-service';
import Link from 'next/link';

export default function CandidateResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sidebar = (
    <>
      <Link href="/candidate/dashboard">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <FileText className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link href="/candidate/resumes">
        <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
          <FileText className="w-4 h-4 mr-2" />
          My Resumes
        </Button>
      </Link>
    </>
  );

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setIsLoading(true);
        const data = await getResumes();
        setResumes(data);
      } catch (err) {
        setError('Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="My Resumes" sidebar={sidebar}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Resumes" sidebar={sidebar}>
      <div className="max-w-6xl mx-auto space-y-8">
        {error ? (
          <Card className="border-border border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : resumes.length === 0 ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>No Resumes Yet</CardTitle>
              <CardDescription>
                Upload your first resume to get started finding job matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/candidate/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Upload Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="border-border hover:border-primary/50 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{resume.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{resume.email}</p>
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

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            {skill}
                          </Badge>
                        ))}
                        {resume.skills.length > 5 && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                            +{resume.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
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
