'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Briefcase, Loader2 } from 'lucide-react';
import { uploadJob, type Job } from '@/lib/api-service';

interface JobUploadProps {
  onSuccess?: (job: Job) => void;
}

export function JobUpload({ onSuccess }: JobUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    salaryRange: '',
    location: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.requiredSkills || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const job = await uploadJob({
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        salaryRange: formData.salaryRange,
        location: formData.location,
      });

      setSuccess('Job posting created successfully!');
      setFormData({
        title: '',
        description: '',
        requiredSkills: '',
        salaryRange: '',
        location: '',
      });

      onSuccess?.(job);
    } catch (err: any) {
      console.error('Job creation error:', err);
      const msg = err?.message || (typeof err === 'string' ? err : 'Unknown error occurred');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>Create a job posting to find matching candidates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Senior Full Stack Developer"
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="San Francisco, CA"
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range (Optional)</Label>
            <Input
              id="salary"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleInputChange}
              placeholder="$120K - $160K"
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma-separated) *</Label>
            <Input
              id="skills"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              placeholder="React, Node.js, TypeScript, PostgreSQL"
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and requirements..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 min-h-32"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Job Post...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Create Job Post
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
