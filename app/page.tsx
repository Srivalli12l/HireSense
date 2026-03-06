'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap, Brain, BarChart3, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && user) {
      router.push(user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard');
    }
  }, [user, router, isInitialized]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
            </div>
            <span className="font-bold text-lg text-foreground">HireSense</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How It Works</a>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/login')} className="text-foreground hover:bg-primary/10">
                Sign In
              </Button>
              <Button onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-balance mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Intelligent Resume Screening
            </span>
            {' '}Made Simple
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            AI-powered platform that matches resumes with job opportunities instantly. For recruiters and job seekers alike.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base h-12 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
              Start Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')} className="border-border px-6 py-3 text-base h-12 transition-all hover:bg-muted/30 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-sm">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-muted-foreground">Intelligent algorithms match resumes with job requirements instantly and accurately.</p>
            </div>

            <div className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Process hundreds of resumes in seconds and identify top candidates instantly.</p>
            </div>

            <div className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-muted-foreground">Get comprehensive insights about skill gaps and career recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">For Candidates: Upload Your Resume</h3>
                <p className="text-muted-foreground">Upload your resume and let our AI analyze your skills and experience to find perfect job matches.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">For Recruiters: Post Job Descriptions</h3>
                <p className="text-muted-foreground">Post your job requirements and instantly get matched with the most suitable candidates in your database.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Intelligent Insights</h3>
                <p className="text-muted-foreground">Receive detailed reports with match scores, skill gaps, and personalized recommendations for career growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of recruiters and job seekers using HireSense to find better matches faster.
        </p>
        <Button onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90 px-6 py-3 text-base h-12 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
          Sign Up Free <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </section>
    </div>
  );
}
