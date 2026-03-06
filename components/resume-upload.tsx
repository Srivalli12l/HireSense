'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Upload, Loader2, Sparkles, Save } from 'lucide-react';
import { parseResume, uploadResume, type Resume } from '@/lib/api-service';

interface ResumeUploadProps {
  onSuccess?: (resume: Resume) => void;
}

export function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Phase 1: Upload PDF → Parse → Auto-fill form
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');
    setAutoFilled(false);
    setIsParsingFile(true);

    try {
      const extracted = await parseResume(selectedFile);

      setFormData({
        candidateName: extracted.name || '',
        email: extracted.email || '',
        phone: extracted.phone || '',
        skills: Array.isArray(extracted.skills) ? extracted.skills.join(', ') : '',
        experience: extracted.experience || '',
        education: extracted.education || '',
      });

      setAutoFilled(true);
      setSuccess('✨ Resume parsed! Fields auto-filled — review and edit before submitting.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume. Please fill fields manually.');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Phase 2: User reviews → clicks Submit → save to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.candidateName || !formData.email) {
      setError('Name and email are required.');
      return;
    }

    if (!file && !formData.skills) {
      setError('Please upload a PDF resume or fill in your skills manually.');
      return;
    }

    setIsSaving(true);
    try {
      const uploadFormData = new FormData();

      if (file) {
        uploadFormData.append('file', file);
      } else {
        // Manual entry: create a synthetic text blob
        const blob = new Blob([
          `Name: ${formData.candidateName}\nSkills: ${formData.skills}\nExperience: ${formData.experience}\nEducation: ${formData.education}`
        ], { type: 'application/pdf' });
        uploadFormData.append('file', blob, 'manual-entry.pdf');
      }

      uploadFormData.append('candidateName', formData.candidateName);
      uploadFormData.append('email', formData.email);
      uploadFormData.append('phone', formData.phone);

      const resumeData = await uploadResume(uploadFormData);

      setSuccess('Resume saved successfully!');
      setFormData({ candidateName: '', email: '', phone: '', skills: '', experience: '', education: '' });
      setFile(null);
      setAutoFilled(false);

      onSuccess?.(resumeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isParsingFile || isSaving;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>Upload a PDF and we'll auto-fill your details using AI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* File Upload Zone */}
          <div className="p-6 border-2 border-dashed border-border rounded-xl bg-card/50 hover:bg-card/80 transition text-center">
            {isParsingFile ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-primary">Parsing resume with AI...</p>
                <p className="text-xs text-muted-foreground">Extracting name, skills, experience...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Click to upload PDF resume</p>
                <p className="text-xs text-muted-foreground mt-1">AI will auto-fill the form below</p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-file"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => document.getElementById('resume-file')?.click()}
                  disabled={isLoading}
                >
                  Select File
                </Button>
                {file && (
                  <p className="text-sm text-primary mt-2 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {file.name}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Auto-filled badge */}
          {autoFilled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">Fields auto-filled from resume — review and edit as needed</span>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
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
                  className={`bg-input border-border ${autoFilled && formData.candidateName ? 'ring-1 ring-primary/30' : ''}`}
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
                  className={`bg-input border-border ${autoFilled && formData.email ? 'ring-1 ring-primary/30' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                  className={`bg-input border-border ${autoFilled && formData.phone ? 'ring-1 ring-primary/30' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Professional Details {!file && <span className="normal-case font-normal">(fill manually if no PDF)</span>}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, TypeScript"
                  disabled={isLoading}
                  className={`bg-input border-border ${autoFilled && formData.skills ? 'ring-1 ring-primary/30' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="5 years of full-stack development..."
                  disabled={isLoading}
                  className={`w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50 min-h-20 ${autoFilled && formData.experience ? 'ring-1 ring-primary/30' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="BSc Computer Science, MIT"
                  disabled={isLoading}
                  className={`bg-input border-border ${autoFilled && formData.education ? 'ring-1 ring-primary/30' : ''}`}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {autoFilled ? 'Confirm & Save Resume' : file ? 'Upload and Save' : 'Save Details'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
