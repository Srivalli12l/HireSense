'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Mail, Briefcase } from 'lucide-react';
import { rankCandidatesForJob, type CandidateRankEntry } from '@/lib/api-service';

interface CandidateRankingProps {
  jobId: string;
}

export function CandidateRanking({ jobId }: CandidateRankingProps) {
  const [candidates, setCandidates] = useState<CandidateRankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const data = await rankCandidatesForJob(jobId);
        setCandidates(data.sort((a, b) => b.matchScore - a.matchScore));
      } catch (err) {
        setError('Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [jobId]);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Top Candidates</CardTitle>
          <CardDescription>Ranking candidates for this position</CardDescription>
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
          <CardTitle>Top Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (index === 1) return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    if (index === 2) return 'bg-amber-600/20 text-amber-600 border-amber-600/30';
    return '';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Top Candidates</CardTitle>
        <CardDescription>Candidates ranked by skill match for this position</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No candidates found</p>
          ) : (
            candidates.map((candidate, index) => (
              <div
                key={candidate.candidateId}
                className={`p-4 border border-border rounded-lg hover:border-primary/50 transition ${
                  getRankColor(index) ? 'bg-card/70' : 'bg-card/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{candidate.candidateName}</h3>
                      {index < 3 && (
                        <Badge className={getRankColor(index)}>
                          <Award className="w-3 h-3 mr-1" />
                          #{index + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {candidate.yearsOfExperience} yrs
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">{candidate.matchScore}%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {candidate.matchedSkills} of {candidate.totalRequired} skills matched
                  </span>
                  <Badge className={getMatchColor(candidate.matchScore)}>
                    {candidate.matchScore >= 80
                      ? 'Excellent'
                      : candidate.matchScore >= 60
                      ? 'Good'
                      : 'Fair'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
