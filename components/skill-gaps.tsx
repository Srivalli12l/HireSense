'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { getSkillGaps, type SkillGap } from '@/lib/api-service';

interface SkillGapsProps {
  resumeId: string;
}

export function SkillGaps({ resumeId }: SkillGapsProps) {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGaps = async () => {
      try {
        setIsLoading(true);
        const data = await getSkillGaps(resumeId);
        setGaps(data);
      } catch (err) {
        setError('Failed to load skill gaps');
      } finally {
        setIsLoading(false);
      }
    };

    loadGaps();
  }, [resumeId]);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Skill Gaps</CardTitle>
          <CardDescription>Analyzing skills needed for career growth</CardDescription>
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
          <CardTitle>Skill Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const importanceColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Recommended Skills</CardTitle>
        <CardDescription>Skills to develop for better career opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gaps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No skill gaps identified. You're all set!</p>
            </div>
          ) : (
            gaps.map((gap) => (
              <div
                key={gap.skill}
                className="p-4 border border-border rounded-lg bg-card/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{gap.skill}</h3>
                      <Badge className={importanceColors[gap.importance]}>
                        {gap.importance.charAt(0).toUpperCase() + gap.importance.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent flex-shrink-0" />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {gap.recommendation}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
