'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { uploadResume, type Resume } from '@/lib/api-service';

interface ResumeUploadProps {
  onSuccess?: (resume: Resume) => void;
}

export function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
    summary: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.candidateName || !formData.email || !formData.phone || !formData.skills) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const resume = await uploadResume({
        id: '',
        candidateName: formData.candidateName,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: formData.experience,
        education: formData.education,
        summary: formData.summary,
        uploadedAt: new Date().toISOString(),
      });

      setSuccess('Resume uploaded successfully!');
      setFormData({
        candidateName: '',
        email: '',
        phone: '',
        skills: '',
        experience: '',
        education: '',
        summary: '',
      });

      onSuccess?.(resume);
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>Share your professional information to find matching job opportunities</CardDescription>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated) *</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, TypeScript"
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="5 years of full-stack development..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="BS Computer Science from MIT..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Brief summary of your professional background..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 min-h-20"
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
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
