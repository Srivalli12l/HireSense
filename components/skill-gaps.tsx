'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Target, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { getSkillGaps, type SkillGapAnalysisResult } from '@/lib/api-service';

interface SkillGapsProps {
  resumeId: string;
}

export function SkillGaps({ resumeId }: SkillGapsProps) {
  const [roleInput, setRoleInput] = useState('');
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const data = await getSkillGaps(resumeId, roleInput);
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze skill gaps for this role.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading && !error) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Enter a target job role to see what skills you're missing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <Input
              placeholder="e.g. MERN Developer, Product Manager..."
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!roleInput.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Analyzing Role Requirements...</CardTitle>
          <CardDescription>Matching your resume against {roleInput}</CardDescription>
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
          <CardTitle>Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setError('')}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Skill Gap Analysis</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Target className="w-4 h-4 text-primary" /> Target Role: <span className="font-semibold text-foreground">{analysis?.jobRole}</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)} className="h-8 text-xs">
            Change Role
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-lg bg-card/50 text-center">
            <p className="text-3xl font-bold text-green-500 mb-1">{analysis?.matchScore}%</p>
            <p className="text-sm font-medium text-muted-foreground uppercase">Skill Match Score</p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card/50 text-center">
            <p className="text-3xl font-bold text-amber-500 mb-1">{analysis?.gapScore}%</p>
            <p className="text-sm font-medium text-muted-foreground uppercase">Skill Gap Score</p>
          </div>
        </div>

        {/* Skill Lists */}
        <div className="space-y-4 border-t border-border pt-4">
          {analysis?.matchedSkills && analysis.matchedSkills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> Matched Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis?.missingSkills && analysis.missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mt-4 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-amber-500" /> Missing Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Improvement Suggestions */}
        {analysis?.suggestions && analysis.suggestions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" /> Improvement Suggestions
            </p>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border border-border rounded-md bg-accent/5">
                  <h4 className="font-medium text-accent mb-1 text-sm">{suggestion.skill}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
