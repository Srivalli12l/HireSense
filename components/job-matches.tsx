'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { findJobMatches, type JobMatch } from '@/lib/api-service';

interface JobMatchesProps {
  resumeId: string;
}

export function JobMatches({ resumeId }: JobMatchesProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        const data = await findJobMatches(resumeId);
        setMatches(data.sort((a, b) => b.matchScore - a.matchScore));
      } catch (err) {
        setError('Failed to load job matches');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [resumeId]);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Job Matches</CardTitle>
          <CardDescription>Finding opportunities that match your skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle>Job Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Job Matches</CardTitle>
        <CardDescription>Opportunities that match your skills and experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No matching jobs found</p>
          ) : (
            matches.map((match) => (
              <div
                key={match.jobId}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition bg-card/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{match.jobTitle}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{match.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {match.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Your Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <XCircle className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
